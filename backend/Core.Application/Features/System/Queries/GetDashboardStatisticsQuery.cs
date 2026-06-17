using Core.Application.DTOs.System;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.Users;
using Core.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.System.Queries;

public class GetDashboardStatisticsQuery : IRequest<DashboardStatisticsDto>
{
}

public class GetDashboardStatisticsQueryHandler : IRequestHandler<GetDashboardStatisticsQuery, DashboardStatisticsDto>
{
    private readonly IGenericRepository<Order> _orderRepo;
    private readonly IGenericRepository<Product> _productRepo;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetDashboardStatisticsQueryHandler(
        IGenericRepository<Order> orderRepo,
        IGenericRepository<Product> productRepo,
        UserManager<ApplicationUser> userManager)
    {
        _orderRepo = orderRepo;
        _productRepo = productRepo;
        _userManager = userManager;
    }

    public async Task<DashboardStatisticsDto> Handle(GetDashboardStatisticsQuery request, CancellationToken cancellationToken)
    {
        var allOrders = await _orderRepo.GetAllAsync();
        var allProducts = await _productRepo.GetAllAsync();
        var totalUsers = _userManager.Users.Count();

        return new DashboardStatisticsDto
        {
            TotalUsers = totalUsers,
            TotalOrders = allOrders.Count(),
            TotalRevenue = allOrders.Where(o => o.PaymentStatus == PaymentStatus.Paid).Sum(o => o.FinalAmount),
            PendingOrders = allOrders.Count(o => o.Status == OrderStatus.Pending),
            LowStockProducts = allProducts.Count(p => p.StockQuantity > 0 && p.StockQuantity <= 10) 
        };
    }
}