using System;

namespace Core.Application.DTOs.Health;

public class HealthProgressDto
{
    public DateTime DateRecorded { get; set; }
    public double Weight { get; set; }
    public double BmiValue { get; set; }
    public double? BodyFatPercentage { get; set; }
    public double? MuscleMassPercentage { get; set; }
}