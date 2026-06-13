using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Application.Interfaces.Services;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Financials;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.Users;
using Core.Domain.Enums;
using MediatR;
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
    private readonly IStockNotificationService _stockNotificationService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrderCommandHandler(
        IGenericRepository<Cart> cartRepository,
        IGenericRepository<CartItem> cartItemRepository,
        IGenericRepository<Product> productRepository,
        IGenericRepository<Coupon> couponRepository,
        IGenericRepository<Order> orderRepository,
        IGenericRepository<UserProfile> userProfileRepository,
        IGenericRepository<WalletTransaction> walletTransactionRepository,
        IStockNotificationService stockNotificationService,
        IUnitOfWork unitOfWork)
    {
        _cartRepository = cartRepository;
        _cartItemRepository = cartItemRepository;
        _productRepository = productRepository;
        _couponRepository = couponRepository;
        _orderRepository = orderRepository;
        _userProfileRepository = userProfileRepository;
        _walletTransactionRepository = walletTransactionRepository;
        _stockNotificationService = stockNotificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var cart = await _cartRepository.FirstOrDefaultAsync(c => c.UserId == request.UserId);
        if (cart == null) throw new BadRequestException("Cart is empty.");

        var cartItems = (await _cartItemRepository.FindAsync(ci => ci.CartId == cart.Id)).ToList();
        if (!cartItems.Any()) throw new BadRequestException("Cart is empty.");

        decimal subTotal = 0;
        var orderItems = new List<OrderItem>();

       
        var updatedStocks = new List<(Guid ProductId, int NewStock)>();

        foreach (var item in cartItems)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product == null) throw new NotFoundException(nameof(Product), item.ProductId);

            if (product.StockQuantity < item.Quantity)
                throw new ConflictException($"Not enough stock available for product: {product.Name}");

            product.StockQuantity -= item.Quantity;
            _productRepository.Update(product);

            updatedStocks.Add((product.Id, product.StockQuantity));

            decimal unitPrice = product.DiscountPrice ?? product.Price;
            subTotal += unitPrice * item.Quantity;

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = unitPrice
            });
        }

        decimal discountAmount = 0;
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var appliedCoupon = await _couponRepository.FirstOrDefaultAsync(c => c.Code.ToLower() == request.CouponCode.ToLower());
            if (appliedCoupon == null || !appliedCoupon.IsActive || appliedCoupon.ExpiryDate < DateTime.UtcNow || appliedCoupon.UsageCount >= appliedCoupon.UsageLimit)
                throw new BadRequestException("Invalid, expired, or fully consumed coupon code.");

            discountAmount = subTotal * (appliedCoupon.DiscountPercentage / 100m);
            if (appliedCoupon.MaxDiscountAmount.HasValue && discountAmount > appliedCoupon.MaxDiscountAmount.Value)
                discountAmount = appliedCoupon.MaxDiscountAmount.Value;

            appliedCoupon.UsageCount++;
            _couponRepository.Update(appliedCoupon);
        }

        var finalAmount = subTotal - discountAmount;
        if (finalAmount < 0) finalAmount = 0;

        var orderId = Guid.NewGuid();
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

        if (request.PaymentMethod == PaymentMethod.Wallet)
        {
            var userProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == request.UserId);
            if (userProfile == null) throw new NotFoundException(nameof(UserProfile), request.UserId);

            if (userProfile.WalletBalance < finalAmount)
                throw new BadRequestException("Insufficient wallet balance to complete this purchase.");

            userProfile.WalletBalance -= finalAmount;
            _userProfileRepository.Update(userProfile);

            var walletTransaction = new WalletTransaction
            {
                UserId = request.UserId,
                Amount = finalAmount,
                Type = TransactionType.Withdrawal,
                Description = $"Payment deduction for Order #{order.Id}",
                ReferenceOrderId = order.Id
            };
            await _walletTransactionRepository.AddAsync(walletTransaction);

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