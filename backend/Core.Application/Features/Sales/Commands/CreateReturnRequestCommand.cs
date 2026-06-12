using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Commands;

public class CreateReturnRequestCommand : IRequest<Guid>
{
    public Guid OrderId { get; set; }
    public string Reason { get; set; } = string.Empty;

    // Ignored in JSON payload to prevent IDOR attacks.
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class CreateReturnRequestCommandHandler : IRequestHandler<CreateReturnRequestCommand, Guid>
{
    private readonly IGenericRepository<Order> _orderRepository;
    private readonly IGenericRepository<ReturnRequest> _returnRequestRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateReturnRequestCommandHandler(
        IGenericRepository<Order> orderRepository,
        IGenericRepository<ReturnRequest> returnRequestRepository,
        IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _returnRequestRepository = returnRequestRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateReturnRequestCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId);
        if (order == null)
            throw new NotFoundException(nameof(Order), request.OrderId);

        
        if (order.UserId != request.UserId)
            throw new ConflictException("You do not have permission to request a return for this order.");

        // only return delivered orders
        if (order.Status != OrderStatus.Delivered)
            throw new BadRequestException("Only delivered orders can be returned.");

        // Ensure no duplicate return requests exist for this order
        var existingRequest = await _returnRequestRepository.FirstOrDefaultAsync(r => r.OrderId == request.OrderId);
        if (existingRequest != null)
            throw new ConflictException("A return request has already been submitted for this order.");

        var returnRequest = new ReturnRequest
        {
            OrderId = request.OrderId,
            UserId = request.UserId,
            Reason = request.Reason,
            Status = ReturnStatus.Pending
        };

        await _returnRequestRepository.AddAsync(returnRequest);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return returnRequest.Id;
    }
}