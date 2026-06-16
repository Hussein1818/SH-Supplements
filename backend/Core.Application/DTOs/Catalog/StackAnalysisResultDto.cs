using System.Collections.Generic;

namespace Core.Application.DTOs.Catalog;

public class StackAnalysisResultDto
{
    public bool IsSafe { get; set; } = true;
    public List<string> Warnings { get; set; } = new List<string>();
    public List<IngredientTotalDto> IngredientTotals { get; set; } = new List<IngredientTotalDto>();
}

