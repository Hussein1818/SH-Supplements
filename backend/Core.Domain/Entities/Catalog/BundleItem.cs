using Core.Domain.Common;
using System;

namespace Core.Domain.Entities.Catalog;

public class BundleItem : BaseEntity
{
    public Guid BundleId { get; set; }
    public ProductBundle Bundle { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }
}