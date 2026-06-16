using System;

namespace Core.Application.DTOs.Catalog;

public class FlashSaleProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal OriginalPrice { get; set; }
    public decimal DiscountPrice { get; set; }
    public decimal SavingsPercentage { get; set; }
    public int StockQuantity { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
}