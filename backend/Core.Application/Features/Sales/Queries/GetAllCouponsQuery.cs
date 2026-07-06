using Core.Application.DTOs.Sales;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Queries;

public class GetAllCouponsQuery : IRequest<List<AdminCouponListDto>>
{
}

public class GetAllCouponsQueryHandler : IRequestHandler<GetAllCouponsQuery, List<AdminCouponListDto>>
{
    private readonly IGenericRepository<Coupon> _couponRepo;

    public GetAllCouponsQueryHandler(IGenericRepository<Coupon> couponRepo)
    {
        _couponRepo = couponRepo;
    }

    public async Task<List<AdminCouponListDto>> Handle(GetAllCouponsQuery request, CancellationToken cancellationToken)
    {
        var coupons = await _couponRepo.GetAllAsync();

        var result = coupons.OrderByDescending(c => c.CreatedAt).Select(c => new AdminCouponListDto
        {
            Id = c.Id,
            Code = c.Code,
            DiscountPercentage = c.DiscountPercentage,
            DiscountAmount = c.DiscountAmount,
            DiscountType = c.DiscountType,
            MaxDiscountAmount = c.MaxDiscountAmount,
            MinimumOrderAmount = c.MinimumOrderAmount,
            ExpiryDate = c.ExpiryDate,
            IsActive = c.IsActive,
            UsageLimit = c.UsageLimit,
            UsageCount = c.UsageCount
        }).ToList();

        return result;
    }
}