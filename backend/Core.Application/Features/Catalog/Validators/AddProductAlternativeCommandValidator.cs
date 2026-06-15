using FluentValidation;
using Core.Application.Features.Catalog.Commands;

namespace Core.Application.Features.Catalog.Validators;

public class AddProductAlternativeCommandValidator : AbstractValidator<AddProductAlternativeCommand>
{
    public AddProductAlternativeCommandValidator()
    {
        RuleFor(v => v.ProductId)
            .NotEmpty().WithMessage("Original Product ID is required.");

        RuleFor(v => v.AlternativeProductId)
            .NotEmpty().WithMessage("Alternative Product ID is required.")
            .NotEqual(v => v.ProductId).WithMessage("A product cannot be an alternative to itself.");
    }
}