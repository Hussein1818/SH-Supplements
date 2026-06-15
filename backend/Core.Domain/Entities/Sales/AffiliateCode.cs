using Core.Domain.Common;
using Core.Domain.Entities.Users;

namespace Core.Domain.Entities.Sales;

public class AffiliateCode : BaseEntity
{
    public string Code { get; set; } = string.Empty;

    public string CoachUserId { get; set; } = string.Empty;
    public UserProfile CoachProfile { get; set; } = null!;

    public decimal DiscountPercentage { get; set; }
    public decimal CommissionPercentage { get; set; }

    public int UsageCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}