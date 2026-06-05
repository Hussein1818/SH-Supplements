using Core.Domain.Common;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Users;

namespace Core.Domain.Entities.System;

public class ProductSubscription : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public UserProfile UserProfile { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int FrequencyInDays { get; set; } 
    public DateTime NextDeliveryDate { get; set; }

    public bool IsActive { get; set; } = true;
}