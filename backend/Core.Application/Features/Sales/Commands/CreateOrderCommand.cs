using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Application.Interfaces.Services;
using Core.Application.Settings;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Financials;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.Users;
using Core.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Commands;

public class CreateOrderCommand : IRequest<Guid>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;

    public string ShippingAddress { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; }

    public string? CouponCode { get; set; }

    public string? AffiliateCode { get; set; }

    public int PointsToRedeem { get; set; } = 0;
}

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IGenericRepository<Cart> _cartRepository;
    private readonly IGenericRepository<CartItem> _cartItemRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IGenericRepository<Coupon> _couponRepository;
    private readonly IGenericRepository<Order> _orderRepository;
    private readonly IGenericRepository<UserProfile> _userProfileRepository;
    private readonly IGenericRepository<WalletTransaction> _walletTransactionRepository;
    private readonly IGenericRepository<AffiliateCode> _affiliateCodeRepository;
    private readonly IStockNotificationService _stockNotificationService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly LoyaltySettings _loyaltySettings;

    public CreateOrderCommandHandler(
        IGenericRepository<Cart> cartRepository,
        IGenericRepository<CartItem> cartItemRepository,
        IGenericRepository<Product> productRepository,
        IGenericRepository<Coupon> couponRepository,
        IGenericRepository<Order> orderRepository,
        IGenericRepository<UserProfile> userProfileRepository,
        IGenericRepository<WalletTransaction> walletTransactionRepository,
        IGenericRepository<AffiliateCode> affiliateCodeRepository,
        IStockNotificationService stockNotificationService,
        IUnitOfWork unitOfWork,
        IOptions<LoyaltySettings> loyaltySettings)
    {
        _cartRepository = cartRepository;
        _cartItemRepository = cartItemRepository;
        _productRepository = productRepository;
        _couponRepository = couponRepository;
        _orderRepository = orderRepository;
        _userProfileRepository = userProfileRepository;
        _walletTransactionRepository = walletTransactionRepository;
        _affiliateCodeRepository = affiliateCodeRepository;
        _stockNotificationService = stockNotificationService;
        _unitOfWork = unitOfWork;
        _loyaltySettings = loyaltySettings.Value;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var cart = await _cartRepository.FirstOrDefaultAsync(c => c.UserId == request.UserId);
        if (cart == null) throw new BadRequestException("Cart is empty.");

        var cartItems = (await _cartItemRepository.FindAsync(ci => ci.CartId == cart.Id)).ToList();
        if (!cartItems.Any()) throw new BadRequestException("Cart is empty.");

        var userProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == request.UserId);
        if (userProfile == null) throw new NotFoundException(nameof(UserProfile), request.UserId);

        decimal subTotal = 0;
        var orderItems = new List<OrderItem>();
        var updatedStocks = new List<(Guid ProductId, int NewStock)>();

        var orderId = Guid.NewGuid();

        foreach (var item in cartItems)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product == null) throw new NotFoundException(nameof(Product), item.ProductId);

            if (product.StockQuantity < item.Quantity)
                throw new ConflictException($"Not enough stock available for product: {product.Name}");

            product.StockQuantity -= item.Quantity;
            _productRepository.Update(product);

            updatedStocks.Add((product.Id, product.StockQuantity));

            decimal unitPrice = item.UnitPrice ?? (product.DiscountPrice ?? product.Price);
            subTotal += unitPrice * item.Quantity;

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = unitPrice
            });
        }

        decimal discountAmount = 0;

        // Apply either Coupon OR Affiliate Code (Mutually Exclusive)
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var appliedCoupon = await _couponRepository.FirstOrDefaultAsync(c => c.Code.ToLower() == request.CouponCode.ToLower());
            if (appliedCoupon == null || !appliedCoupon.IsActive || appliedCoupon.ExpiryDate < DateTime.UtcNow || appliedCoupon.UsageCount >= appliedCoupon.UsageLimit)
                throw new BadRequestException("Invalid, expired, or fully consumed coupon code.");

            if (appliedCoupon.MinimumOrderAmount.HasValue && subTotal < appliedCoupon.MinimumOrderAmount.Value)
                throw new BadRequestException($"Minimum order amount of {appliedCoupon.MinimumOrderAmount.Value} is required for this coupon.");

            // Process dynamic discount types
            if (appliedCoupon.DiscountType == DiscountType.Percentage)
            {
                discountAmount = subTotal * (appliedCoupon.DiscountPercentage / 100m);
                if (appliedCoupon.MaxDiscountAmount.HasValue && discountAmount > appliedCoupon.MaxDiscountAmount.Value)
                    discountAmount = appliedCoupon.MaxDiscountAmount.Value;
            }
            else if (appliedCoupon.DiscountType == DiscountType.FixedAmount)
            {
                discountAmount = appliedCoupon.DiscountAmount;
            }

            // Ensure discount does not exceed subtotal
            if (discountAmount > subTotal) discountAmount = subTotal;

            appliedCoupon.UsageCount++;
            _couponRepository.Update(appliedCoupon);
        }
        else if (!string.IsNullOrWhiteSpace(request.AffiliateCode))
        {
            var affiliate = await _affiliateCodeRepository.FirstOrDefaultAsync(a => a.Code.ToLower() == request.AffiliateCode.ToLower());

            if (affiliate == null || !affiliate.IsActive)
                throw new BadRequestException("Invalid or inactive affiliate code.");

            // Prevent Coach from using their own code
            if (affiliate.CoachUserId == request.UserId)
                throw new ConflictException("You cannot use your own affiliate code for personal purchases.");

            discountAmount = subTotal * (affiliate.DiscountPercentage / 100m);
            affiliate.UsageCount++;
            _affiliateCodeRepository.Update(affiliate);

            // Calculate and assign commission to the Coach
            var coachProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == affiliate.CoachUserId);
            if (coachProfile != null)
            {
                decimal commissionAmount = (subTotal - discountAmount) * (affiliate.CommissionPercentage / 100m);
                coachProfile.WalletBalance += commissionAmount;
                _userProfileRepository.Update(coachProfile);

                await _walletTransactionRepository.AddAsync(new WalletTransaction
                {
                    UserId = coachProfile.UserId,
                    Amount = commissionAmount,
                    Type = TransactionType.Deposit,
                    Description = $"Affiliate commission for referring Order #{orderId}",
                    ReferenceOrderId = orderId
                });
            }
        }

        decimal amountAfterCoupon = subTotal - discountAmount;

        // Loyalty Points Redemption Logic
        if (request.PointsToRedeem > 0)
        {
            if (userProfile.LoyaltyPoints < request.PointsToRedeem)
                throw new BadRequestException("Insufficient loyalty points.");

            decimal pointsDiscount = request.PointsToRedeem * _loyaltySettings.RedemptionDiscountPerPoint;

            if (pointsDiscount > amountAfterCoupon)
            {
                int maxPointsAllowed = (int)(amountAfterCoupon / _loyaltySettings.RedemptionDiscountPerPoint);
                throw new BadRequestException($"You cannot redeem more points than the order total. Maximum points allowed for this order is {maxPointsAllowed}.");
            }

            discountAmount += pointsDiscount;
            userProfile.LoyaltyPoints -= request.PointsToRedeem;
        }

        var finalAmount = subTotal - discountAmount;
        if (finalAmount < 0) finalAmount = 0;

        var order = new Order
        {
            Id = orderId,
            UserId = request.UserId,
            TotalAmount = subTotal,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount,
            ShippingAddress = request.ShippingAddress,
            PaymentMethod = request.PaymentMethod,
            Items = orderItems
        };

        // Wallet Payment Logic
        if (request.PaymentMethod == PaymentMethod.Wallet)
        {
            if (userProfile.WalletBalance < finalAmount)
                throw new BadRequestException("Insufficient wallet balance to complete this purchase.");

            userProfile.WalletBalance -= finalAmount;

            await _walletTransactionRepository.AddAsync(new WalletTransaction
            {
                UserId = request.UserId,
                Amount = finalAmount,
                Type = TransactionType.Withdrawal,
                Description = $"Payment deduction for Order #{order.Id}",
                ReferenceOrderId = order.Id
            });

            order.PaymentStatus = PaymentStatus.Paid;
            order.Status = OrderStatus.Processing;
        }
        else
        {
            order.PaymentStatus = PaymentStatus.Unpaid;
            order.Status = OrderStatus.Pending;
        }

        await _orderRepository.AddAsync(order);

        foreach (var item in cartItems)
        {
            _cartItemRepository.Delete(item);
        }

        int earnedPoints = (int)(finalAmount * _loyaltySettings.PointsPerCurrencyUnit);
        userProfile.LoyaltyPoints += earnedPoints;

        _userProfileRepository.Update(userProfile);

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex) when (ex.GetType().Name == "DbUpdateConcurrencyException")
        {
            throw new ConflictException("Sorry, one or more products in your cart were just sold out or updated by another user. Please review your cart and try again.");
        }

        foreach (var stock in updatedStocks)
        {
            await _stockNotificationService.NotifyStockUpdateAsync(stock.ProductId, stock.NewStock);
        }

        return order.Id;
    }
}