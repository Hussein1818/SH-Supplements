using Core.Application.DTOs.Health;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Health;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Health.Queries;

public class GetUserHealthMetricsHistoryQuery : IRequest<List<HealthMetricRecordDto>>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class GetUserHealthMetricsHistoryQueryHandler : IRequestHandler<GetUserHealthMetricsHistoryQuery, List<HealthMetricRecordDto>>
{
    private readonly IGenericRepository<HealthMetricRecord> _healthRepository;

    public GetUserHealthMetricsHistoryQueryHandler(IGenericRepository<HealthMetricRecord> healthRepository)
    {
        _healthRepository = healthRepository;
    }

    public Task<List<HealthMetricRecordDto>> Handle(GetUserHealthMetricsHistoryQuery request, CancellationToken cancellationToken)
    {
        var history = _healthRepository.GetQueryable()
            .Where(h => h.UserId == request.UserId)
            .OrderByDescending(h => h.CreatedAt)
            .Select(h => new HealthMetricRecordDto
            {
                Id = h.Id,
                Weight = h.Weight,
                Height = h.Height,
                Age = h.Age,
                Gender = h.Gender.ToString(),
                ActivityLevel = h.ActivityLevel.ToString(),
                BmiValue = h.BmiValue,
                BmiCategory = h.BmiCategory.ToString(),
                BmrValue = h.BmrValue,
                TdeeValue = h.TdeeValue,
                RecordedAt = h.CreatedAt
            })
            .ToList();

        return Task.FromResult(history);
    }
}