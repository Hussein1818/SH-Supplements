using System;

namespace Core.Application.DTOs.Catalog;

public class ProductImageDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsMainImage { get; set; }
}

