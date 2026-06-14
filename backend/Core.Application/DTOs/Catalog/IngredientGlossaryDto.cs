namespace Core.Application.DTOs.Catalog;

public class IngredientGlossaryDto
{
    public string IngredientName { get; set; } = string.Empty;
    public string ScientificBenefit { get; set; } = string.Empty;
    public string? PotentialWarnings { get; set; }
}