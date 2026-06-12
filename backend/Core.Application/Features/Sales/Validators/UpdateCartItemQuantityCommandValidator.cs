using FluentValidation;
using Core.Application.Features.Sales.Commands;

namespace Core.Application.Features.Sales.Validators;

public class UpdateCartItemQuantityCommandValidator : AbstractValidator<UpdateCartItemQuantityCommand>
{
    public UpdateCartItemQuantityCommandValidator()
    {
        RuleFor(v => v.CartItemId).NotEmpty().WithMessage("Cart Item ID is required.");
        RuleFor(v => v.Quantity).GreaterThan(0).WithMessage("Quantity must be at least 1.");
    }
}