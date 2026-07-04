namespace Core.Application.DTOs.Sales;

public class CouponDto
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public string DiscountType { get; set; } = string.Empty;
    public decimal? MinimumOrderAmount { get; set; }
}