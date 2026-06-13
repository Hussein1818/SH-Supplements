using Core.Domain.Common;
using Core.Domain.Entities.Users;
using System;
using System.Collections.Generic;

namespace Core.Domain.Entities.System;

public class ProductSubscription : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public UserProfile UserProfile { get; set; } = null!;

    public string ShippingAddress { get; set; } = string.Empty;

    public int FrequencyInDays { get; set; }
    public DateTime NextDeliveryDate { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation property for multiple products in one subscription
    public ICollection<SubscriptionItem> Items { get; set; } = new List<SubscriptionItem>();
}