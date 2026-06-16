using Core.Application.DTOs.Users;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Users;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Users.Queries;

public class GetUserDosageScheduleQuery : IRequest<List<UserDosageDto>>
{
    public string UserId { get; set; } = string.Empty;
}

public class GetUserDosageScheduleQueryHandler : IRequestHandler<GetUserDosageScheduleQuery, List<UserDosageDto>>
{
    private readonly IGenericRepository<UserDosageSchedule> _scheduleRepo;

    public GetUserDosageScheduleQueryHandler(IGenericRepository<UserDosageSchedule> scheduleRepo)
    {
        _scheduleRepo = scheduleRepo;
    }

    public async Task<List<UserDosageDto>> Handle(GetUserDosageScheduleQuery request, CancellationToken cancellationToken)
    {
        var schedules = await _scheduleRepo.FindAsync(s => s.UserId == request.UserId);

        return schedules.Select(s => new UserDosageDto
        {
            ProductId = s.ProductId,
            ProductName = s.Product?.Name ?? "Unknown Product", 
            ScheduledTime = s.ScheduledTime,
            Instruction = s.Instruction,
            PhaseName = s.PhaseName,
            IsEmailReminderEnabled = s.IsEmailReminderEnabled
        }).OrderBy(s => s.ScheduledTime).ToList();
    }
}