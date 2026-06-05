using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities.Sales;

public class ReturnRequest : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public string UserId { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;

    public ReturnStatus Status { get; set; } = ReturnStatus.Pending;
    public string? AdminNotes { get; set; } 
}