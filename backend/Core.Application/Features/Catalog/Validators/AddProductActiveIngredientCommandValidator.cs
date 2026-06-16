using FluentValidation;
using Core.Application.Features.Catalog.Commands;

namespace Core.Application.Features.Catalog.Validators;

public class AddProductActiveIngredientCommandValidator : AbstractValidator<AddProductActiveIngredientCommand>
{
    public AddProductActiveIngredientCommandValidator()
    {
        RuleFor(v => v.ProductId)
            .NotEmpty().WithMessage("Product ID is required.");

        RuleFor(v => v.ActiveIngredientId)
            .NotEmpty().WithMessage("Active Ingredient ID is required.");

        RuleFor(v => v.AmountPerServing)
            .GreaterThan(0).WithMessage("Amount per serving must be greater than zero.");
    }
}