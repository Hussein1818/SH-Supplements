using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Health;
using Core.Domain.Entities.Users;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Health.Commands;

public class AddHealthMeasurementCommand : IRequest<Guid>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;

    public double? Weight { get; set; }
    public double? BodyFatPercentage { get; set; }
    public double? MuscleMassPercentage { get; set; }
}

public class AddHealthMeasurementCommandHandler : IRequestHandler<AddHealthMeasurementCommand, Guid>
{
    private readonly IGenericRepository<HealthMetricRecord> _healthRepository;
    private readonly IGenericRepository<UserProfile> _userProfileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddHealthMeasurementCommandHandler(
        IGenericRepository<HealthMetricRecord> healthRepository,
        IGenericRepository<UserProfile> userProfileRepository,
        IUnitOfWork unitOfWork)
    {
        _healthRepository = healthRepository;
        _userProfileRepository = userProfileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(AddHealthMeasurementCommand request, CancellationToken cancellationToken)
    {
        var userProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == request.UserId);
        if (userProfile == null)
            throw new NotFoundException(nameof(UserProfile), request.UserId);

        var userRecords = await _healthRepository.FindAsync(h => h.UserId == request.UserId);
        var lastRecord = userRecords.OrderByDescending(h => h.CreatedAt).FirstOrDefault();

        double finalWeight = request.Weight ?? lastRecord?.Weight ?? (double)userProfile.Weight;
        double? finalBodyFat = request.BodyFatPercentage ?? lastRecord?.BodyFatPercentage;
        double? finalMuscleMass = request.MuscleMassPercentage ?? lastRecord?.MuscleMassPercentage;

        var gender = lastRecord?.Gender ?? Gender.Male;
        var activityLevel = lastRecord?.ActivityLevel ?? ActivityLevel.LightlyActive;

        double heightInMeters = (double)userProfile.Height / 100.0;
        double bmiValue = heightInMeters > 0 ? Math.Round(finalWeight / (heightInMeters * heightInMeters), 2) : 0;

        BmiCategory category = BmiCategory.NormalWeight;
        if (bmiValue > 0)
        {
            if (bmiValue < 18.5) category = BmiCategory.Underweight;
            else if (bmiValue >= 25 && bmiValue < 30) category = BmiCategory.Overweight;
            else if (bmiValue >= 30) category = BmiCategory.Obese;
        }

        double bmrValue = gender == Gender.Male
            ? (10 * finalWeight) + (6.25 * (double)userProfile.Height) - (5 * userProfile.Age) + 5
            : (10 * finalWeight) + (6.25 * (double)userProfile.Height) - (5 * userProfile.Age) - 161;

        double tdeeMultiplier = activityLevel switch
        {
            ActivityLevel.Sedentary => 1.2,
            ActivityLevel.LightlyActive => 1.375,
            ActivityLevel.ModeratelyActive => 1.55,
            ActivityLevel.VeryActive => 1.725,
            ActivityLevel.ExtraActive => 1.9,
            _ => 1.2
        };

        var record = new HealthMetricRecord
        {
            UserId = request.UserId,
            Weight = finalWeight,
            BodyFatPercentage = finalBodyFat,
            MuscleMassPercentage = finalMuscleMass,
            Height = (double)userProfile.Height,
            Age = userProfile.Age,
            BmiValue = bmiValue,
            BmiCategory = category,
            Gender = gender,
            ActivityLevel = activityLevel,
            BmrValue = bmrValue,
            TdeeValue = bmrValue * tdeeMultiplier
        };

        userProfile.Weight = (decimal)finalWeight;
        _userProfileRepository.Update(userProfile);

        await _healthRepository.AddAsync(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return record.Id;
    }
}