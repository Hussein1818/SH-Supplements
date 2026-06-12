using Core.Application.DTOs.Sales;
using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Queries;

public class ValidateCouponQuery : IRequest<CouponDto>
{
    public string Code { get; set; } = string.Empty;
}

public class ValidateCouponQueryHandler : IRequestHandler<ValidateCouponQuery, CouponDto>
{
    private readonly IGenericRepository<Coupon> _couponRepository;

    public ValidateCouponQueryHandler(IGenericRepository<Coupon> couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<CouponDto> Handle(ValidateCouponQuery request, CancellationToken cancellationToken)
    {
        var coupon = await _couponRepository.FirstOrDefaultAsync(c => c.Code.ToLower() == request.Code.ToLower());

        if (coupon == null)
            throw new NotFoundException(nameof(Coupon), request.Code);

        // Security & Business Validation checks
        if (!coupon.IsActive)
            throw new BadRequestException("This coupon is no longer active.");

        if (coupon.ExpiryDate < DateTime.UtcNow)
            throw new BadRequestException("This coupon has expired.");

        if (coupon.UsageCount >= coupon.UsageLimit)
            throw new BadRequestException("This coupon has reached its usage limit.");

        return new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            DiscountPercentage = coupon.DiscountPercentage,
            MaxDiscountAmount = coupon.MaxDiscountAmount
        };
    }
}