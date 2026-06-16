using System;

namespace Core.Application.DTOs.Catalog;

public class ProductDosageGuideDto
{
    public TimeSpan RecommendedTime { get; set; }
    public string Instruction { get; set; } = string.Empty;
    public string PhaseName { get; set; } = string.Empty;
}