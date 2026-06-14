using FluentValidation;
using Core.Application.Features.Catalog.Commands;

namespace Core.Application.Features.Catalog.Validators;

public class AddIngredientGlossaryCommandValidator : AbstractValidator<AddIngredientGlossaryCommand>
{
    public AddIngredientGlossaryCommandValidator()
    {
        RuleFor(v => v.IngredientName)
            .NotEmpty().WithMessage("Ingredient name is required.")
            .MaximumLength(150).WithMessage("Ingredient name must not exceed 150 characters.");

        RuleFor(v => v.ScientificBenefit)
            .NotEmpty().WithMessage("Scientific benefit description is required.");
    }
}