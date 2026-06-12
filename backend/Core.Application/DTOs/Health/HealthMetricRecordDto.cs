using System;

namespace Core.Application.DTOs.Health;

public class HealthMetricRecordDto
{
    public Guid Id { get; set; }

    public double Weight { get; set; }
    public double Height { get; set; }
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string ActivityLevel { get; set; } = string.Empty;

    public double BmiValue { get; set; }
    public string BmiCategory { get; set; } = string.Empty;

    public double BmrValue { get; set; }
    public double TdeeValue { get; set; }

    public DateTime RecordedAt { get; set; }
}