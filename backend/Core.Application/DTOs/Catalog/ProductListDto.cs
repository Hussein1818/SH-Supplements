using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Catalog;

public class ProductListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string MainImageUrl { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public UserGoal Goal { get; set; }
    public double AverageRating { get; set; }
}