using Core.Application.Features.Sales.Commands;
using FluentValidation;

namespace Core.Application.Features.Sales.Validators;

public class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Order ID is required.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid order status.");
    }
}