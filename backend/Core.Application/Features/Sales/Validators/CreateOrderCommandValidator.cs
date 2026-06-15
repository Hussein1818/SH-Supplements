using FluentValidation;
using Core.Application.Features.Sales.Commands;

namespace Core.Application.Features.Sales.Validators;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(v => v.ShippingAddress)
            .NotEmpty().WithMessage("Shipping address is required.")
            .MaximumLength(500).WithMessage("Shipping address must not exceed 500 characters.");

        RuleFor(v => v.PaymentMethod)
            .IsInEnum().WithMessage("Invalid payment method.");

        RuleFor(v => v.PointsToRedeem)
            .GreaterThanOrEqualTo(0).WithMessage("Points to redeem cannot be negative.");

        RuleFor(v => v.AffiliateCode)
            .MaximumLength(50).WithMessage("Affiliate code must not exceed 50 characters.");

        RuleFor(v => v)
            .Must(v => string.IsNullOrWhiteSpace(v.CouponCode) || string.IsNullOrWhiteSpace(v.AffiliateCode))
            .WithMessage("You cannot use both a coupon code and an affiliate code at the same time.");
    }
}