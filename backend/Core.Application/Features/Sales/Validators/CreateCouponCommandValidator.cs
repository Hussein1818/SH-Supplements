using FluentValidation;
using Core.Application.Features.Sales.Commands;
using System;

namespace Core.Application.Features.Sales.Validators;

public class CreateCouponCommandValidator : AbstractValidator<CreateCouponCommand>
{
    public CreateCouponCommandValidator()
    {
        RuleFor(v => v.Code).NotEmpty().WithMessage("Coupon code is required.");
        RuleFor(v => v.DiscountPercentage).InclusiveBetween(1, 100).WithMessage("Discount must be between 1% and 100%.");
        RuleFor(v => v.UsageLimit).GreaterThan(0).WithMessage("Usage limit must be at least 1.");
        RuleFor(v => v.ExpiryDate).GreaterThan(DateTime.UtcNow).WithMessage("Expiry date must be in the future.");
    }
}