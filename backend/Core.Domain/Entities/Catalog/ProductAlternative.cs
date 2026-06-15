using System;
using Core.Domain.Common;

namespace Core.Domain.Entities.Catalog;

public class ProductAlternative : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid AlternativeProductId { get; set; }
    public Product AlternativeProduct { get; set; } = null!;
}