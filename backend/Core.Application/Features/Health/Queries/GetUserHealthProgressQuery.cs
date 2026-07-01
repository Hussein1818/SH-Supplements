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

public class GetUserHealthProgressQuery : IRequest<List<HealthProgressDto>>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class GetUserHealthProgressQueryHandler : IRequestHandler<GetUserHealthProgressQuery, List<HealthProgressDto>>
{
    private readonly IGenericRepository<HealthMetricRecord> _healthRepository;

    public GetUserHealthProgressQueryHandler(IGenericRepository<HealthMetricRecord> healthRepository)
    {
        _healthRepository = healthRepository;
    }

    public Task<List<HealthProgressDto>> Handle(GetUserHealthProgressQuery request, CancellationToken cancellationToken)
    {
        var progressChart = _healthRepository.GetQueryable()
            .Where(h => h.UserId == request.UserId)
            .OrderBy(h => h.CreatedAt) 
            .Select(h => new HealthProgressDto
            {
                DateRecorded = h.CreatedAt,
                Weight = h.Weight,
                BmiValue = h.BmiValue,
                BodyFatPercentage = h.BodyFatPercentage,
                MuscleMassPercentage = h.MuscleMassPercentage
            })
            .ToList();

        return Task.FromResult(progressChart);
    }
}