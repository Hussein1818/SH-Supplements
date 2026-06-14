using System;

namespace Core.Application.DTOs.Catalog;

public class PersonalizedProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string MatchReason { get; set; } = string.Empty;
}