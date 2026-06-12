using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Commands;

public class CreateCouponCommand : IRequest<Guid>
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime ExpiryDate { get; set; }
    public int UsageLimit { get; set; }
}

public class CreateCouponCommandHandler : IRequestHandler<CreateCouponCommand, Guid>
{
    private readonly IGenericRepository<Coupon> _couponRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCouponCommandHandler(IGenericRepository<Coupon> couponRepository, IUnitOfWork unitOfWork)
    {
        _couponRepository = couponRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateCouponCommand request, CancellationToken cancellationToken)
    {
        // Ensure coupon code is unique
        var existingCoupon = await _couponRepository.FirstOrDefaultAsync(c => c.Code.ToLower() == request.Code.ToLower());
        if (existingCoupon != null)
            throw new ConflictException("A coupon with this code already exists.");

        var coupon = new Coupon
        {
            Code = request.Code.ToUpper(), 
            DiscountPercentage = request.DiscountPercentage,
            MaxDiscountAmount = request.MaxDiscountAmount,
            ExpiryDate = request.ExpiryDate,
            UsageLimit = request.UsageLimit,
            IsActive = true,
            UsageCount = 0
        };

        await _couponRepository.AddAsync(coupon);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return coupon.Id;
    }
}