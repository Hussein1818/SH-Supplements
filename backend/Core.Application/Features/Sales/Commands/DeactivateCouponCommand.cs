using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Commands;

public class DeactivateCouponCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeactivateCouponCommandHandler : IRequestHandler<DeactivateCouponCommand, bool>
{
    private readonly IGenericRepository<Coupon> _couponRepo;
    private readonly IUnitOfWork _unitOfWork;

    public DeactivateCouponCommandHandler(IGenericRepository<Coupon> couponRepo, IUnitOfWork unitOfWork)
    {
        _couponRepo = couponRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeactivateCouponCommand request, CancellationToken cancellationToken)
    {
        var coupon = await _couponRepo.GetByIdAsync(request.Id);
        if (coupon == null) throw new NotFoundException(nameof(Coupon), request.Id);

        coupon.IsActive = false; 

        _couponRepo.Update(coupon);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}