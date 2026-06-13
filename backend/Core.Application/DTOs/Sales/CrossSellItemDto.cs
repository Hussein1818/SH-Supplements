using System;

namespace Core.Application.DTOs.Sales;

public class CrossSellItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductImageUrl { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string SuggestionReason { get; set; } = string.Empty;
}