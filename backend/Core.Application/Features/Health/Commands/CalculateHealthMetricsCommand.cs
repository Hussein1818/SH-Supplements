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

public class CalculateHealthMetricsCommand : IRequest<Guid>
{
    public double? Weight { get; set; }
    public double? Height { get; set; }
    public int? Age { get; set; }
    public Gender? Gender { get; set; }
    public ActivityLevel? ActivityLevel { get; set; }

    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class CalculateHealthMetricsCommandHandler : IRequestHandler<CalculateHealthMetricsCommand, Guid>
{
    private readonly IGenericRepository<HealthMetricRecord> _healthRepository;
    private readonly IGenericRepository<UserProfile> _userProfileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CalculateHealthMetricsCommandHandler(
        IGenericRepository<HealthMetricRecord> healthRepository,
        IGenericRepository<UserProfile> userProfileRepository,
        IUnitOfWork unitOfWork)
    {
        _healthRepository = healthRepository;
        _userProfileRepository = userProfileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CalculateHealthMetricsCommand request, CancellationToken cancellationToken)
    {
        var userProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == request.UserId);
        if (userProfile == null)
            throw new NotFoundException(nameof(UserProfile), request.UserId);

        var userRecords = await _healthRepository.FindAsync(h => h.UserId == request.UserId);
        var lastRecord = userRecords.OrderByDescending(h => h.CreatedAt).FirstOrDefault();

        double finalWeight = request.Weight ?? lastRecord?.Weight ?? (double)userProfile.Weight;
        double finalHeight = request.Height ?? lastRecord?.Height ?? (double)userProfile.Height;
        int finalAge = request.Age ?? lastRecord?.Age ?? userProfile.Age;
        Gender finalGender = request.Gender ?? lastRecord?.Gender ?? Gender.Male;
        ActivityLevel finalActivityLevel = request.ActivityLevel ?? lastRecord?.ActivityLevel ?? ActivityLevel.LightlyActive;

        var heightInMeters = finalHeight / 100.0;
        var bmiValue = heightInMeters > 0 ? Math.Round(finalWeight / (heightInMeters * heightInMeters), 2) : 0;

        var bmiCategory = BmiCategory.NormalWeight;
        if (bmiValue > 0)
        {
            if (bmiValue < 18.5) bmiCategory = BmiCategory.Underweight;
            else if (bmiValue >= 25 && bmiValue <= 29.9) bmiCategory = BmiCategory.Overweight;
            else if (bmiValue >= 30) bmiCategory = BmiCategory.Obese;
        }

        double bmrValue = (10 * finalWeight) + (6.25 * finalHeight) - (5 * finalAge);
        bmrValue = finalGender == Gender.Male ? bmrValue + 5 : bmrValue - 161;

        double activityMultiplier = finalActivityLevel switch
        {
            ActivityLevel.Sedentary => 1.2,
            ActivityLevel.LightlyActive => 1.375,
            ActivityLevel.ModeratelyActive => 1.55,
            ActivityLevel.VeryActive => 1.725,
            ActivityLevel.ExtraActive => 1.9,
            _ => 1.2
        };

        var tdeeValue = Math.Round(bmrValue * activityMultiplier, 2);

        var record = new HealthMetricRecord
        {
            UserId = request.UserId,
            Weight = finalWeight,
            Height = finalHeight,
            Age = finalAge,
            Gender = finalGender,
            ActivityLevel = finalActivityLevel,
            BmiValue = bmiValue,
            BmiCategory = bmiCategory,
            BmrValue = Math.Round(bmrValue, 2),
            TdeeValue = tdeeValue
        };

        userProfile.Weight = (decimal)finalWeight;
        userProfile.Height = (decimal)finalHeight;
        userProfile.Age = finalAge;
        _userProfileRepository.Update(userProfile);

        await _healthRepository.AddAsync(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return record.Id;
    }
}