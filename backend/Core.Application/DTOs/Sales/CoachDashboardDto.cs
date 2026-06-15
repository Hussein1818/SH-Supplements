namespace Core.Application.DTOs.Sales;

public class CoachDashboardDto
{
    public string AffiliateCode { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public decimal CommissionPercentage { get; set; }
    public decimal CurrentWalletBalance { get; set; }
}