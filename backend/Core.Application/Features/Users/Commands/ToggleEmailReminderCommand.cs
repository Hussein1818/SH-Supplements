using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Users;
using MediatR;
using System;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Users.Commands;

public class ToggleEmailReminderCommand : IRequest<bool>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public bool EnableEmail { get; set; }
}

public class ToggleEmailReminderCommandHandler : IRequestHandler<ToggleEmailReminderCommand, bool>
{
    private readonly IGenericRepository<UserDosageSchedule> _scheduleRepo;
    private readonly IUnitOfWork _unitOfWork;

    public ToggleEmailReminderCommandHandler(
        IGenericRepository<UserDosageSchedule> scheduleRepo,
        IUnitOfWork unitOfWork)
    {
        _scheduleRepo = scheduleRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ToggleEmailReminderCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepo.FirstOrDefaultAsync(s =>
            s.UserId == request.UserId && s.ProductId == request.ProductId);

        if (schedule == null)
            throw new NotFoundException(nameof(UserDosageSchedule), request.ProductId);

        schedule.IsEmailReminderEnabled = request.EnableEmail;
        _scheduleRepo.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}