using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Sales;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Core.Domain.Constants;

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
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrderCommandHandler(
        IGenericRepository<Cart> cartRepository,
        IGenericRepository<CartItem> cartItemRepository,
        IGenericRepository<Product> productRepository,
        IGenericRepository<Coupon> couponRepository,
        IGenericRepository<Order> orderRepository,
        IUnitOfWork unitOfWork)
    {
        _cartRepository = cartRepository;
        _cartItemRepository = cartItemRepository;
        _productRepository = productRepository;
        _couponRepository = couponRepository;
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Fetch Cart and Items
        var cart = await _cartRepository.FirstOrDefaultAsync(c => c.UserId == request.UserId);
        if (cart == null)
            throw new BadRequestException("Cart is empty.");

        var cartItems = (await _cartItemRepository.FindAsync(ci => ci.CartId == cart.Id)).ToList();
        if (!cartItems.Any())
            throw new BadRequestException("Cart is empty.");

        // 2. Process Items, Validate Stock, and Calculate SubTotal
        decimal subTotal = 0;
        var orderItems = new List<OrderItem>();

        foreach (var item in cartItems)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product == null)
                throw new NotFoundException(nameof(Product), item.ProductId);

            // Critical Stock Validation
            if (product.StockQuantity < item.Quantity)
                throw new ConflictException($"Not enough stock available for product: {product.Name}");

            // Deduct Stock
            product.StockQuantity -= item.Quantity;
            _productRepository.Update(product);

            // Snapshot Price Strategy
            decimal unitPrice = product.DiscountPrice ?? product.Price;
            subTotal += unitPrice * item.Quantity;

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = unitPrice
            });
        }

        // 3. Process Coupon (If Applied)
        decimal discountAmount = 0;
        Coupon? appliedCoupon = null;

        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            appliedCoupon = await _couponRepository.FirstOrDefaultAsync(c => c.Code.ToLower() == request.CouponCode.ToLower());

            if (appliedCoupon == null || !appliedCoupon.IsActive || appliedCoupon.ExpiryDate < DateTime.UtcNow || appliedCoupon.UsageCount >= appliedCoupon.UsageLimit)
                throw new BadRequestException("Invalid, expired, or fully consumed coupon code.");

            // Calculate percentage discount
            discountAmount = subTotal * (appliedCoupon.DiscountPercentage / 100);

            // Enforce max discount limit
            if (appliedCoupon.MaxDiscountAmount.HasValue && discountAmount > appliedCoupon.MaxDiscountAmount.Value)
            {
                discountAmount = appliedCoupon.MaxDiscountAmount.Value;
            }

            // Increment coupon usage
            appliedCoupon.UsageCount++;
            _couponRepository.Update(appliedCoupon);
        }

        // 4. Create Order Entity
        var finalAmount = subTotal - discountAmount;
        if (finalAmount < 0) finalAmount = 0;

        var order = new Order
        {
            UserId = request.UserId,
            TotalAmount = subTotal, 
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount,
            ShippingAddress = request.ShippingAddress,
            PaymentMethod = request.PaymentMethod,
            Status = OrderStatus.Pending,
            PaymentStatus = PaymentStatus.Unpaid,
            Items = orderItems
        };

        await _orderRepository.AddAsync(order);

        // 5. Clear the Cart
        foreach (var item in cartItems)
        {
            _cartItemRepository.Delete(item);
        }

        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return order.Id;
    }
}