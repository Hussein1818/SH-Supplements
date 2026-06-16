using FluentValidation;
using Core.Application.Features.Catalog.Commands;

namespace Core.Application.Features.Catalog.Validators;

public class AddActiveIngredientCommandValidator : AbstractValidator<AddActiveIngredientCommand>
{
    public AddActiveIngredientCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Active ingredient name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(v => v.MaximumSafeDailyDose)
            .GreaterThan(0).WithMessage("Maximum safe daily dose must be greater than zero.");

        RuleFor(v => v.UnitOfMeasurement)
            .NotEmpty().WithMessage("Unit of measurement is required (e.g., mg, g, IU).")
            .MaximumLength(20).WithMessage("Unit of measurement must not exceed 20 characters.");
    }
}