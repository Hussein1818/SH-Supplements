using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Commands;

public class UpdateReturnStatusCommand : IRequest<Unit>
{
    public Guid ReturnRequestId { get; set; }
    public ReturnStatus Status { get; set; }
    public string? AdminNotes { get; set; }
}

public class UpdateReturnStatusCommandHandler : IRequestHandler<UpdateReturnStatusCommand, Unit>
{
    private readonly IGenericRepository<ReturnRequest> _returnRequestRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateReturnStatusCommandHandler(
        IGenericRepository<ReturnRequest> returnRequestRepository,
        IUnitOfWork unitOfWork)
    {
        _returnRequestRepository = returnRequestRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(UpdateReturnStatusCommand request, CancellationToken cancellationToken)
    {
        var returnRequest = await _returnRequestRepository.GetByIdAsync(request.ReturnRequestId);
        if (returnRequest == null)
            throw new NotFoundException(nameof(ReturnRequest), request.ReturnRequestId);

        returnRequest.Status = request.Status;
        returnRequest.AdminNotes = request.AdminNotes;

        _returnRequestRepository.Update(returnRequest);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}