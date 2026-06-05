using Core.Domain.Common;
using Core.Domain.Entities.Users;
using Core.Domain.Enums;

namespace Core.Domain.Entities.Financials;

public class WalletTransaction : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public UserProfile UserProfile { get; set; } = null!;

    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }

    // Reason for the transaction (e.g., "Refund for Order #123")
    public string Description { get; set; } = string.Empty;

    // Optional link to an order if the transaction is order-related
    public Guid? ReferenceOrderId { get; set; }
}