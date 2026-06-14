using Core.Domain.Common;
using System;

namespace Core.Domain.Entities.Catalog;

public class ProductSerialNumber : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string SerialNumber { get; set; } = string.Empty;

    public int VerificationCount { get; set; } = 0;
    public DateTime? FirstVerifiedAt { get; set; }
}