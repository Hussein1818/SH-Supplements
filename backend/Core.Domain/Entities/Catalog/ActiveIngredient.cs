using Core.Domain.Common;
using System.Collections.Generic;

namespace Core.Domain.Entities.Catalog;

public class ActiveIngredient : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public decimal MaximumSafeDailyDose { get; set; }

    public string UnitOfMeasurement { get; set; } = string.Empty;

    public ICollection<ProductActiveIngredient> ProductIngredients { get; set; } = new List<ProductActiveIngredient>();
}