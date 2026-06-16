using System;
using Core.Domain.Common;

namespace Core.Domain.Entities.Catalog;

public class ProductActiveIngredient : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid ActiveIngredientId { get; set; }
    public ActiveIngredient ActiveIngredient { get; set; } = null!;

    public decimal AmountPerServing { get; set; }
}