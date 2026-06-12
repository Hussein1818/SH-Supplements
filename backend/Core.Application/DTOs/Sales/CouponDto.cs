using System;

namespace Core.Application.DTOs.Sales;

public class CouponDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
}