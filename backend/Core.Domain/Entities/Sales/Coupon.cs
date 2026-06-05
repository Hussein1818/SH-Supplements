using Core.Domain.Common;

namespace Core.Domain.Entities.Sales;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }

    // Maximum amount that can be discounted
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;

    // Number of times this coupon can be used
    public int UsageLimit { get; set; }
    public int UsageCount { get; set; } = 0;
}