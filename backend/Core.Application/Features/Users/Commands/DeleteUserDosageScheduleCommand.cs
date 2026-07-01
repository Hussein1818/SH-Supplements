using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Users;
using MediatR;
using System;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Users.Commands;

public class DeleteUserDosageScheduleCommand : IRequest<bool>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
}

public class DeleteUserDosageScheduleCommandHandler : IRequestHandler<DeleteUserDosageScheduleCommand, bool>
{
    private readonly IGenericRepository<UserDosageSchedule> _scheduleRepo;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteUserDosageScheduleCommandHandler(
        IGenericRepository<UserDosageSchedule> scheduleRepo,
        IUnitOfWork unitOfWork)
    {
        _scheduleRepo = scheduleRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteUserDosageScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepo.FirstOrDefaultAsync(s =>
            s.UserId == request.UserId && s.ProductId == request.ProductId);

        if (schedule == null)
            throw new NotFoundException(nameof(UserDosageSchedule), request.ProductId);

        _scheduleRepo.Delete(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}