using System;

namespace Core.Application.DTOs.Catalog;

public class ActiveIngredientDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal MaximumSafeDailyDose { get; set; }
    public string UnitOfMeasurement { get; set; } = string.Empty;
}