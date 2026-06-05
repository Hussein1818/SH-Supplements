using Core.Domain.Common;

namespace Core.Domain.Entities.Catalog;

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string ImageUrl { get; set; } = string.Empty;

    // To identify the primary image shown in the catalog
    public bool IsMainImage { get; set; }
}