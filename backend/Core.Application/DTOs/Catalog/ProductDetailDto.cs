using System;
using System.Collections.Generic;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Catalog;

public class ProductDetailDto
{
    public Guid Id { get; set; }
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
    public UserGoal Goal { get; set; }

    public CategoryDto Category { get; set; } = null!;
    public BrandDto Brand { get; set; } = null!;

    public double AverageRating { get; set; }
    public ICollection<ProductImageDto> Images { get; set; } = new List<ProductImageDto>();
    public ICollection<ReviewDto> Reviews { get; set; } = new List<ReviewDto>();
}