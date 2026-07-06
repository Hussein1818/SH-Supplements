using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Sales;

public class AdminCouponListDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public DiscountType? DiscountType { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinimumOrderAmount { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsActive { get; set; }
    public int UsageLimit { get; set; }
    public int UsageCount { get; set; }
}