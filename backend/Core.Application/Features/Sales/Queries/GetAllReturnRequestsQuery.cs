using Core.Application.DTOs.Sales;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.Users;
using Core.Domain.Enums;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Queries;

public class GetAllReturnRequestsQuery : IRequest<List<AdminReturnRequestListDto>>
{
    public ReturnStatus? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class GetAllReturnRequestsQueryHandler : IRequestHandler<GetAllReturnRequestsQuery, List<AdminReturnRequestListDto>>
{
    private readonly IGenericRepository<ReturnRequest> _returnRepo;
    private readonly IGenericRepository<UserProfile> _userProfileRepo;

    public GetAllReturnRequestsQueryHandler(IGenericRepository<ReturnRequest> returnRepo, IGenericRepository<UserProfile> userProfileRepo)
    {
        _returnRepo = returnRepo;
        _userProfileRepo = userProfileRepo;
    }

    public async Task<List<AdminReturnRequestListDto>> Handle(GetAllReturnRequestsQuery request, CancellationToken cancellationToken)
    {
        var query = _returnRepo.GetQueryable();

        if (request.Status.HasValue)
        {
            query = query.Where(r => r.Status == request.Status.Value);
        }

        var returns = query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var userIds = returns.Select(r => r.UserId).Distinct().ToList();
        var profiles = await _userProfileRepo.FindAsync(up => userIds.Contains(up.UserId));
        var profileDict = profiles.ToDictionary(p => p.UserId, p => $"{p.FirstName} {p.LastName}");

        var result = returns.Select(r => new AdminReturnRequestListDto
        {
            Id = r.Id,
            OrderId = r.OrderId,
            UserId = r.UserId,
            CustomerName = profileDict.TryGetValue(r.UserId, out var name) ? name : "Unknown",
            Reason = r.Reason,
            Status = r.Status,
            RequestedAt = r.CreatedAt,
            AdminNotes = r.AdminNotes
        }).ToList();

        return result;
    }
}