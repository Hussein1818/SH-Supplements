using FluentValidation;
using Core.Application.Features.System.Commands;

namespace Core.Application.Features.System.Validators;

public class CreateSubscriptionCommandValidator : AbstractValidator<CreateSubscriptionCommand>
{
    public CreateSubscriptionCommandValidator()
    {
        RuleFor(v => v.ShippingAddress)
            .NotEmpty().WithMessage("Shipping address is required.");

        RuleFor(v => v.FrequencyInDays)
            .GreaterThan(0).WithMessage("Frequency in days must be greater than zero.");

        RuleFor(v => v.Items)
            .NotEmpty().WithMessage("Subscription must contain at least one item.");
    }
}