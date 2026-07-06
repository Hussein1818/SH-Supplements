using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Sales;

public class AdminReturnRequestListDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public ReturnStatus Status { get; set; }
    public DateTime RequestedAt { get; set; }
    public string? AdminNotes { get; set; }
}