using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Health;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Health.Commands;

public class CalculateHealthMetricsCommand : IRequest<Guid>
{
    public double Weight { get; set; }
    public double Height { get; set; }
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public ActivityLevel ActivityLevel { get; set; }

    [JsonIgnore] 
    public string UserId { get; set; } = string.Empty;
}

public class CalculateHealthMetricsCommandHandler : IRequestHandler<CalculateHealthMetricsCommand, Guid>
{
    private readonly IGenericRepository<HealthMetricRecord> _healthRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CalculateHealthMetricsCommandHandler(IGenericRepository<HealthMetricRecord> healthRepository, IUnitOfWork unitOfWork)
    {
        _healthRepository = healthRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CalculateHealthMetricsCommand request, CancellationToken cancellationToken)
    {
        // 1. Calculate BMI
        var heightInMeters = request.Height / 100.0;
        var bmiValue = Math.Round(request.Weight / (heightInMeters * heightInMeters), 2);

        var bmiCategory = BmiCategory.NormalWeight;
        if (bmiValue < 18.5) bmiCategory = BmiCategory.Underweight;
        else if (bmiValue >= 25 && bmiValue <= 29.9) bmiCategory = BmiCategory.Overweight;
        else if (bmiValue >= 30) bmiCategory = BmiCategory.Obese;

        // 2. Calculate BMR (Mifflin-St Jeor Equation)
        double bmrValue = (10 * request.Weight) + (6.25 * request.Height) - (5 * request.Age);
        bmrValue = request.Gender == Gender.Male ? bmrValue + 5 : bmrValue - 161;

        // 3. Calculate TDEE
        double activityMultiplier = request.ActivityLevel switch
        {
            ActivityLevel.Sedentary => 1.2,
            ActivityLevel.LightlyActive => 1.375,
            ActivityLevel.ModeratelyActive => 1.55,
            ActivityLevel.VeryActive => 1.725,
            ActivityLevel.ExtraActive => 1.9,
            _ => 1.2
        };

        var tdeeValue = Math.Round(bmrValue * activityMultiplier, 2);

        // 4. Save Record
        var record = new HealthMetricRecord
        {
            UserId = request.UserId,
            Weight = request.Weight,
            Height = request.Height,
            Age = request.Age,
            Gender = request.Gender,
            ActivityLevel = request.ActivityLevel,
            BmiValue = bmiValue,
            BmiCategory = bmiCategory,
            BmrValue = Math.Round(bmrValue, 2),
            TdeeValue = tdeeValue
        };

        await _healthRepository.AddAsync(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return record.Id; 
    }
}