using Core.Domain.Enums;
using System;

namespace Core.Application.DTOs.Sales;

public class ReturnRequestDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public ReturnStatus Status { get; set; }
    public string? AdminNotes { get; set; }
    public DateTime CreatedAt { get; set; }
}