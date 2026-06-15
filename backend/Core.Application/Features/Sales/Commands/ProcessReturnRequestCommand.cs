using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Application.Settings;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.Users;
using Core.Domain.Entities.Financials;
using Core.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Options;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Commands;

public class ProcessReturnRequestCommand : IRequest<bool>
{
    public Guid ReturnRequestId { get; set; }
    public bool IsApproved { get; set; }
}

public class ProcessReturnRequestCommandHandler : IRequestHandler<ProcessReturnRequestCommand, bool>
{
    private readonly IGenericRepository<ReturnRequest> _returnRepository;
    private readonly IGenericRepository<Order> _orderRepository;
    private readonly IGenericRepository<UserProfile> _userProfileRepository;
    private readonly IGenericRepository<WalletTransaction> _walletTxRepository;
    private readonly LoyaltySettings _loyaltySettings;
    private readonly IUnitOfWork _unitOfWork;

    public ProcessReturnRequestCommandHandler(
        IGenericRepository<ReturnRequest> returnRepository,
        IGenericRepository<Order> orderRepository,
        IGenericRepository<UserProfile> userProfileRepository,
        IGenericRepository<WalletTransaction> walletTxRepository,
        IOptions<LoyaltySettings> loyaltySettings,
        IUnitOfWork unitOfWork)
    {
        _returnRepository = returnRepository;
        _orderRepository = orderRepository;
        _userProfileRepository = userProfileRepository;
        _walletTxRepository = walletTxRepository;
        _loyaltySettings = loyaltySettings.Value;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ProcessReturnRequestCommand request, CancellationToken cancellationToken)
    {
        var returnReq = await _returnRepository.GetByIdAsync(request.ReturnRequestId);
        if (returnReq == null) throw new NotFoundException(nameof(ReturnRequest), request.ReturnRequestId);

        var order = await _orderRepository.GetByIdAsync(returnReq.OrderId);
        if (order == null) throw new NotFoundException(nameof(Order), returnReq.OrderId);

        if (request.IsApproved && order.Status != OrderStatus.Refunded)
        {

            var buyerProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == order.UserId);
            if (buyerProfile != null)
            {
                buyerProfile.WalletBalance += order.FinalAmount;

                await _walletTxRepository.AddAsync(new WalletTransaction
                {
                    UserId = order.UserId,
                    Amount = order.FinalAmount,
                    Type = TransactionType.Deposit,
                    Description = $"Refund for returned order #{order.Id}",
                    ReferenceOrderId = order.Id
                });


                int pointsToDeduct = (int)(order.FinalAmount * _loyaltySettings.PointsPerCurrencyUnit);
                buyerProfile.LoyaltyPoints = Math.Max(0, buyerProfile.LoyaltyPoints - pointsToDeduct);

                _userProfileRepository.Update(buyerProfile);
            }

            var commissionTx = await _walletTxRepository.FirstOrDefaultAsync(wt =>
                wt.ReferenceOrderId == order.Id &&
                wt.Type == TransactionType.Deposit &&
                wt.UserId != order.UserId);

            if (commissionTx != null)
            {
                var coachProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == commissionTx.UserId);
                if (coachProfile != null)
                {

                    coachProfile.WalletBalance -= commissionTx.Amount;
                    _userProfileRepository.Update(coachProfile);

                    await _walletTxRepository.AddAsync(new WalletTransaction
                    {
                        UserId = coachProfile.UserId,
                        Amount = commissionTx.Amount,
                        Type = TransactionType.Withdrawal,
                        Description = $"Commission reversal for refunded Order #{order.Id}",
                        ReferenceOrderId = order.Id
                    });
                }
            }

            order.Status = OrderStatus.Refunded;
            order.PaymentStatus = PaymentStatus.Refunded;
            _orderRepository.Update(order);
        }


        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}