using Core.Domain.Common;
using System;

namespace Core.Domain.Entities.Catalog;

public class ProductDosageGuide : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public TimeSpan RecommendedTime { get; set; }
    public string Instruction { get; set; } = string.Empty;
    public string PhaseName { get; set; } = string.Empty;
}