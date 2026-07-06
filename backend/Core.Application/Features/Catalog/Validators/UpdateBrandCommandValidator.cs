using Core.Application.Features.Catalog.Commands;
using FluentValidation;

namespace Core.Application.Features.Catalog.Validators;

public class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
{
    public UpdateBrandCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Brand ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Brand name is required.")
            .MaximumLength(100).WithMessage("Brand name must not exceed 100 characters.");

        RuleFor(x => x.CountryOfOrigin)
            .NotEmpty().WithMessage("Country of origin is required.")
            .MaximumLength(50).WithMessage("Country of origin must not exceed 50 characters.");
    }
}