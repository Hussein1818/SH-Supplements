using Core.Domain.Common;
using Core.Domain.Entities.Catalog;

namespace Core.Domain.Entities.System;

public class StockReservation : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string UserId { get; set; } = string.Empty;
    public int QuantityLocked { get; set; }
    public DateTime LockedUntil { get; set; } 
}