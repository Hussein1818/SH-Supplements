using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Sales;

public class AdminOrderListDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public decimal FinalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
}