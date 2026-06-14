using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities.Health;

public class HealthMetricRecord : BaseEntity
{
    public string UserId { get; set; } = string.Empty;

    public double Weight { get; set; } // in kg
    public double Height { get; set; } // in cm
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public ActivityLevel ActivityLevel { get; set; }

    // Calculated Outputs
    public double BmiValue { get; set; }
    public BmiCategory BmiCategory { get; set; }

    public double BmrValue { get; set; }
    public double TdeeValue { get; set; }
    public double? BodyFatPercentage { get; set; }
    public double? MuscleMassPercentage { get; set; }
}