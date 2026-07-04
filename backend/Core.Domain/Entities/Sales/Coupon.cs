using Core.Domain.Common;
using Core.Domain.Enums;
using System;

namespace Core.Domain.Entities.Sales;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public DiscountType? DiscountType { get; set; } 
    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinimumOrderAmount { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;
    public int UsageLimit { get; set; }
    public int UsageCount { get; set; } = 0;
}