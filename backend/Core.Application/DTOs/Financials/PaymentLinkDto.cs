using System;

namespace Core.Application.DTOs.Financials;

public class PaymentLinkDto
{
    public Guid TransactionId { get; set; }
    public string PaymentUrl { get; set; } = string.Empty;
}