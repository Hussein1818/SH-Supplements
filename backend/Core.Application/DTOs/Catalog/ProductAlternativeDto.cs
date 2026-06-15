using System;

namespace Core.Application.DTOs.Catalog;

public class ProductAlternativeDto
{
    public Guid AlternativeProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public decimal SavingsPercentage { get; set; }
    public string RecommendationMessage { get; set; } = string.Empty;
}