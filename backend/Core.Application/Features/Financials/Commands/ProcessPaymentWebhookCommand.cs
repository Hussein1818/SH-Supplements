using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Application.Interfaces.Services;
using Core.Domain.Entities.Financials;
using Core.Domain.Entities.Sales;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Financials.Commands;

public class ProcessPaymentWebhookCommand : IRequest<bool>
{
    public string TransactionReference { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
    public string HmacSignature { get; set; } = string.Empty;
    public string RawPayload { get; set; } = string.Empty;
}

public class ProcessPaymentWebhookCommandHandler : IRequestHandler<ProcessPaymentWebhookCommand, bool>
{
    private readonly IGenericRepository<PaymentTransaction> _transactionRepository;
    private readonly IGenericRepository<Order> _orderRepository;
    private readonly IPaymentService _paymentService;
    private readonly IUnitOfWork _unitOfWork;

    public ProcessPaymentWebhookCommandHandler(
        IGenericRepository<PaymentTransaction> transactionRepository,
        IGenericRepository<Order> orderRepository,
        IPaymentService paymentService,
        IUnitOfWork unitOfWork)
    {
        _transactionRepository = transactionRepository;
        _orderRepository = orderRepository;
        _paymentService = paymentService;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ProcessPaymentWebhookCommand request, CancellationToken cancellationToken)
    {
        
        bool isValidSignature = await _paymentService.ValidateWebhookSignatureAsync(request.RawPayload, request.HmacSignature);
        if (!isValidSignature)
            throw new UnauthorizedAccessException("Invalid payment webhook signature. Possible spoofing attempt.");

        
        var transaction = await _transactionRepository.FirstOrDefaultAsync(t => t.TransactionReference == request.TransactionReference);
        if (transaction == null)
            throw new NotFoundException(nameof(PaymentTransaction), request.TransactionReference);

        
        if (transaction.Status != PaymentStatus.Unpaid)
            return true;

       
        transaction.Status = request.IsSuccess ? PaymentStatus.Paid : PaymentStatus.Failed;
        _transactionRepository.Update(transaction);

        
        var order = await _orderRepository.GetByIdAsync(transaction.OrderId);
        if (order != null)
        {
            order.PaymentStatus = transaction.Status;

           
            if (transaction.Status == PaymentStatus.Paid)
            {
                order.Status = OrderStatus.Processing;
            }

            _orderRepository.Update(order);
        }

        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}