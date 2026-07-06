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

public class GetAllOrdersQuery : IRequest<List<AdminOrderListDto>>
{
    public OrderStatus? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, List<AdminOrderListDto>>
{
    private readonly IGenericRepository<Order> _orderRepo;
    private readonly IGenericRepository<UserProfile> _userProfileRepo;

    public GetAllOrdersQueryHandler(IGenericRepository<Order> orderRepo, IGenericRepository<UserProfile> userProfileRepo)
    {
        _orderRepo = orderRepo;
        _userProfileRepo = userProfileRepo;
    }

    public async Task<List<AdminOrderListDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _orderRepo.GetQueryable();

        if (request.Status.HasValue)
        {
            query = query.Where(o => o.Status == request.Status.Value);
        }

        var pagedOrders = query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var userIds = pagedOrders.Select(o => o.UserId).Distinct().ToList();
        var profiles = await _userProfileRepo.FindAsync(up => userIds.Contains(up.UserId));
        var profileDict = profiles.ToDictionary(p => p.UserId, p => p);

        var result = pagedOrders.Select(o => new AdminOrderListDto
        {
            Id = o.Id,
            UserId = o.UserId,
            CustomerName = profileDict.TryGetValue(o.UserId, out var profile) ? $"{profile.FirstName} {profile.LastName}" : "Unknown",
            CustomerPhone = profileDict.TryGetValue(o.UserId, out var p) ? p.PhoneNumber : "N/A",
            CreatedAt = o.CreatedAt,
            FinalAmount = o.FinalAmount,
            Status = o.Status,
            PaymentMethod = o.PaymentMethod,
            PaymentStatus = o.PaymentStatus
        }).ToList();

        return result;
    }
}