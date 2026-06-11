using System;

namespace Core.Application.DTOs.Catalog;



public class BrandDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CountryOfOrigin { get; set; } = string.Empty;
}