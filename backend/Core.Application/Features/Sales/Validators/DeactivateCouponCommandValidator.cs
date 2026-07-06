using Core.Application.Features.Sales.Commands;
using FluentValidation;

namespace Core.Application.Features.Sales.Validators;

public class DeactivateCouponCommandValidator : AbstractValidator<DeactivateCouponCommand>
{
    public DeactivateCouponCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Coupon ID is required.");
    }
}