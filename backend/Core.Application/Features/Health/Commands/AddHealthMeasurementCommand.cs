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
    public double Weight { get; set; }
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

        double heightInMeters = (double)userProfile.Height / 100.0;
        double bmiValue = heightInMeters > 0 ? Math.Round(request.Weight / (heightInMeters * heightInMeters), 2) : 0;

        BmiCategory category = BmiCategory.NormalWeight;
        if (bmiValue > 0)
        {
            if (bmiValue < 18.5) category = BmiCategory.Underweight;
            else if (bmiValue >= 25 && bmiValue < 30) category = BmiCategory.Overweight;
            else if (bmiValue >= 30) category = BmiCategory.Obese;
        }

        var userRecords = await _healthRepository.FindAsync(h => h.UserId == request.UserId);
        var lastRecord = userRecords.OrderByDescending(h => h.CreatedAt).FirstOrDefault();

        var gender = lastRecord?.Gender ?? Gender.Male;
        var activityLevel = lastRecord?.ActivityLevel ?? ActivityLevel.LightlyActive;

        double bmrValue = gender == Gender.Male
            ? (10 * request.Weight) + (6.25 * (double)userProfile.Height) - (5 * userProfile.Age) + 5
            : (10 * request.Weight) + (6.25 * (double)userProfile.Height) - (5 * userProfile.Age) - 161;

        double tdeeMultiplier = activityLevel switch
        {
            ActivityLevel.Sedentary => 1.2,
            ActivityLevel.LightlyActive => 1.375,
            ActivityLevel.ModeratelyActive => 1.55,
            ActivityLevel.VeryActive => 1.725,
            ActivityLevel.ExtraActive => 1.9,
            _ => 1.2
        };
        double tdeeValue = bmrValue * tdeeMultiplier;

        var record = new HealthMetricRecord
        {
            UserId = request.UserId,
            Weight = request.Weight,
            BodyFatPercentage = request.BodyFatPercentage,
            MuscleMassPercentage = request.MuscleMassPercentage,
            Height = (double)userProfile.Height,
            Age = userProfile.Age,
            BmiValue = bmiValue,
            BmiCategory = category,
            Gender = gender,
            ActivityLevel = activityLevel,
            BmrValue = bmrValue,
            TdeeValue = tdeeValue
        };

        userProfile.Weight = (decimal)request.Weight;
        _userProfileRepository.Update(userProfile);

        await _healthRepository.AddAsync(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return record.Id;
    }
}