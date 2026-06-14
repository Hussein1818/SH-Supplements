using Core.Domain.Common;

namespace Core.Domain.Entities.Catalog;

public class IngredientGlossary : BaseEntity
{
    public string IngredientName { get; set; } = string.Empty;

    public string ScientificBenefit { get; set; } = string.Empty;
    public string? PotentialWarnings { get; set; }
}