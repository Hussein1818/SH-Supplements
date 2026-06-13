using Core.Application.DTOs.Financials;
using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Application.Interfaces.Services;
using Core.Domain.Entities.Financials;
using Core.Domain.Entities.Sales;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Financials.Commands;

public class InitiatePaymentCommand : IRequest<PaymentLinkDto>
{
    public Guid OrderId { get; set; }
    public string GatewayName { get; set; } = string.Empty;

    [JsonIgnore] 
    public string UserId { get; set; } = string.Empty;
}

public class InitiatePaymentCommandHandler : IRequestHandler<InitiatePaymentCommand, PaymentLinkDto>
{
    private readonly IGenericRepository<Order> _orderRepository;
    private readonly IGenericRepository<PaymentTransaction> _transactionRepository;
    private readonly IPaymentService _paymentService;
    private readonly IUnitOfWork _unitOfWork;

    public InitiatePaymentCommandHandler(
        IGenericRepository<Order> orderRepository,
        IGenericRepository<PaymentTransaction> transactionRepository,
        IPaymentService paymentService,
        IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _transactionRepository = transactionRepository;
        _paymentService = paymentService;
        _unitOfWork = unitOfWork;
    }

    public async Task<PaymentLinkDto> Handle(InitiatePaymentCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId);
        if (order == null)
            throw new NotFoundException(nameof(Order), request.OrderId);

        
        if (order.UserId != request.UserId)
            throw new ConflictException("You do not have permission to pay for this order.");

        if (order.PaymentStatus == PaymentStatus.Paid)
            throw new ConflictException("This order is already paid.");

        
        var transaction = new PaymentTransaction
        {
            OrderId = order.Id,
            GatewayName = request.GatewayName,
            TransactionReference = Guid.NewGuid().ToString("N"), 
            Amount = order.FinalAmount,
            Status = PaymentStatus.Unpaid
        };

        await _transactionRepository.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        
        string paymentUrl = await _paymentService.GeneratePaymentUrlAsync(
            transaction.Id,
            transaction.Amount,
            "Customer", 
            "customer@sh-supplements.com"
        );

        return new PaymentLinkDto
        {
            TransactionId = transaction.Id,
            PaymentUrl = paymentUrl
        };
    }
}