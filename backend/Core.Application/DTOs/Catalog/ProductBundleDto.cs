using System;
using System.Collections.Generic;

namespace Core.Application.DTOs.Catalog;

public class ProductBundleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public bool IsActive { get; set; }
    public List<BundleItemResponseDto> Items { get; set; } = new();
}

public class BundleItemResponseDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
}