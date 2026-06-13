using System;

namespace Core.Application.DTOs.Financials;

public class WalletTransactionDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid? ReferenceOrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}