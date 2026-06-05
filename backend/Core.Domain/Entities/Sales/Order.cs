using Core.Domain.Common;
using Core.Domain.Entities.Users;
using Core.Domain.Enums;

namespace Core.Domain.Entities.Sales;

public class Order : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public UserProfile UserProfile { get; set; } = null!;

    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; } // Total - Discount + Shipping

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;
    public PaymentMethod PaymentMethod { get; set; }

    public string ShippingAddress { get; set; } = string.Empty;
    public string? TrackingNumber { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

