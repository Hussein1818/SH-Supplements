using Core.Application.DTOs.Financials;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Financials;
using Core.Domain.Entities.Users;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Financials.Commands;

public class ChargeWalletCommand : IRequest<WalletTransactionDto>
{
    public decimal Amount { get; set; }

    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class ChargeWalletCommandHandler : IRequestHandler<ChargeWalletCommand, WalletTransactionDto>
{
    private readonly IGenericRepository<WalletTransaction> _transactionRepository;
    private readonly IGenericRepository<UserProfile> _userProfileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ChargeWalletCommandHandler(
        IGenericRepository<WalletTransaction> transactionRepository,
        IGenericRepository<UserProfile> userProfileRepository,
        IUnitOfWork unitOfWork)
    {
        _transactionRepository = transactionRepository;
        _userProfileRepository = userProfileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<WalletTransactionDto> Handle(ChargeWalletCommand request, CancellationToken cancellationToken)
    {
        var userProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == request.UserId);

        if (userProfile == null)
            throw new Exception("User profile not found.");

        userProfile.WalletBalance += request.Amount;
        _userProfileRepository.Update(userProfile);

        var transaction = new WalletTransaction
        {
            UserId = request.UserId,
            Amount = request.Amount,
            Type = TransactionType.Deposit,
            Description = "Wallet recharge via application.",
            ReferenceOrderId = null
        };

        await _transactionRepository.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new WalletTransactionDto
        {
            Id = transaction.Id,
            Amount = transaction.Amount,
            Type = transaction.Type.ToString(),
            Description = transaction.Description,
            ReferenceOrderId = transaction.ReferenceOrderId,
            CreatedAt = DateTime.UtcNow
        };
    }
}