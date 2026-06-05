using Core.Domain.Common;

namespace Core.Domain.Entities.Catalog;


public class Brand : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string CountryOfOrigin { get; set; } = string.Empty;
    public ICollection<Product> Products { get; set; } = new List<Product>();
}