using Core.Domain.Common;
using Core.Domain.Entities.Catalog;
using System;

namespace Core.Domain.Entities.System;

public class SubscriptionItem : BaseEntity
{
    public Guid SubscriptionId { get; set; }
    public ProductSubscription Subscription { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }
}