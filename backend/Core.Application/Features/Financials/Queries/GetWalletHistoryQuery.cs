using Core.Application.DTOs.Financials;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Financials;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Financials.Queries;

public class GetWalletHistoryQuery : IRequest<List<WalletTransactionDto>>
{
    public string UserId { get; set; } = string.Empty;
}

public class GetWalletHistoryQueryHandler : IRequestHandler<GetWalletHistoryQuery, List<WalletTransactionDto>>
{
    private readonly IGenericRepository<WalletTransaction> _transactionRepository;

    public GetWalletHistoryQueryHandler(IGenericRepository<WalletTransaction> transactionRepository)
    {
        _transactionRepository = transactionRepository;
    }

    public Task<List<WalletTransactionDto>> Handle(GetWalletHistoryQuery request, CancellationToken cancellationToken)
    {
        var history = _transactionRepository.GetQueryable()
            .Where(t => t.UserId == request.UserId)
            .OrderByDescending(t => t.CreatedAt) 
            .Select(t => new WalletTransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Type = t.Type.ToString(),
                Description = t.Description,
                ReferenceOrderId = t.ReferenceOrderId,
                CreatedAt = t.CreatedAt
            })
            .ToList(); 

        return Task.FromResult(history);
    }
}