namespace Core.Application.Settings;

public class ClearanceSettings
{
    public int StageOneMonthsThreshold { get; set; }
    public decimal StageOneDiscountPercentage { get; set; }

    public int StageTwoMonthsThreshold { get; set; }
    public decimal StageTwoDiscountPercentage { get; set; }
}