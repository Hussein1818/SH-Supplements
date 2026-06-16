using FluentValidation;
using Core.Application.Features.Catalog.Commands;

namespace Core.Application.Features.Catalog.Validators;

public class AddProductDosageGuideCommandValidator : AbstractValidator<AddProductDosageGuideCommand>
{
    public AddProductDosageGuideCommandValidator()
    {
        RuleFor(v => v.ProductId)
            .NotEmpty().WithMessage("Product ID is required.");

        RuleFor(v => v.Instruction)
            .NotEmpty().WithMessage("Instruction is required.")
            .MaximumLength(200).WithMessage("Instruction must not exceed 200 characters.");

        RuleFor(v => v.PhaseName)
            .NotEmpty().WithMessage("Phase name is required.")
            .MaximumLength(50).WithMessage("Phase name must not exceed 50 characters.");
    }
}