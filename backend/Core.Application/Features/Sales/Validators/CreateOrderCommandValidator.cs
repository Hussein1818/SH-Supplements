using FluentValidation;
using Core.Application.Features.Sales.Commands;

namespace Core.Application.Features.Sales.Validators;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(v => v.ShippingAddress)
            .NotEmpty().WithMessage("Shipping address is required.");

        RuleFor(v => v.PaymentMethod)
            .IsInEnum().WithMessage("Invalid payment method selected.");
    }
}