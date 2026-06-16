using System.Collections.Generic;

namespace Core.Application.DTOs.Catalog;


public class IngredientTotalDto
{
    public string IngredientName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal MaximumSafeDose { get; set; }
    public string Unit { get; set; } = string.Empty;
    public bool ExceedsSafeLimit { get; set; }
}