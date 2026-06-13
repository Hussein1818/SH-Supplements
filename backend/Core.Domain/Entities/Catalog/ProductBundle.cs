using Core.Domain.Common;
using System.Collections.Generic;

namespace Core.Domain.Entities.Catalog;

public class ProductBundle : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Percentage to deduct from the total sum of the bundle items (e.g., 15 for 15% off)
    public decimal DiscountPercentage { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<BundleItem> Items { get; set; } = new List<BundleItem>();
}