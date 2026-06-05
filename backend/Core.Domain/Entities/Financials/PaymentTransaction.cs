using Core.Domain.Common;
using Core.Domain.Entities.Sales;
using Core.Domain.Enums;

namespace Core.Domain.Entities.Financials;

public class PaymentTransaction : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public string GatewayName { get; set; } = string.Empty; // e.g., "Paymob", "Stripe"
    public string TransactionReference { get; set; } = string.Empty; 

    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; }

    public string? GatewayResponse { get; set; } 
}