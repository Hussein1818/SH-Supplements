using Core.Application.Features.Sales.Commands;
using FluentValidation;

namespace Core.Application.Features.Sales.Validators;

public class CancelCustomerOrderCommandValidator : AbstractValidator<CancelCustomerOrderCommand>
{
    public CancelCustomerOrderCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Order ID is required.");
    }
}