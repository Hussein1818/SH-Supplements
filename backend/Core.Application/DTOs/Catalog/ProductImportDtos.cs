using System;
using System.Collections.Generic;
using Core.Domain.Enums;

namespace Core.Application.Features.Catalog.DTOs;

public class ActiveIngredientImportDto
{
    public string Name { get; set; } = string.Empty;
    public decimal MaximumSafeDailyDose { get; set; }
    public string UnitOfMeasurement { get; set; } = string.Empty;
    public decimal AmountPerServing { get; set; }
}

public class DosageGuideImportDto
{
    public TimeSpan RecommendedTime { get; set; }
    public string Instruction { get; set; } = string.Empty;
    public string PhaseName { get; set; } = string.Empty;
}

public class ProductImageImportDto
{
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsMainImage { get; set; }
}

public class ProductImportDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int StockQuantity { get; set; }
    public string Flavor { get; set; } = string.Empty;
    public int Servings { get; set; }
    public string Ingredients { get; set; } = string.Empty;
    public string Warnings { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public bool IsFlashSale { get; set; } = false;
    public UserGoal Goal { get; set; }

    public string CategoryName { get; set; } = string.Empty;
    public string CategoryDescription { get; set; } = string.Empty;

    public string BrandName { get; set; } = string.Empty;
    public string BrandCountryOfOrigin { get; set; } = string.Empty;

    public List<ActiveIngredientImportDto> ActiveIngredients { get; set; } = new();
    public List<DosageGuideImportDto> DosageGuides { get; set; } = new();
    public List<ProductImageImportDto> Images { get; set; } = new();
}