using Core.Application.Features.Catalog.Commands;
using FluentValidation;

namespace Core.Application.Features.Catalog.Validators;

public class CreateBrandCommandValidator : AbstractValidator<CreateBrandCommand>
{
    public CreateBrandCommandValidator()
    {
        RuleFor(v => v.Name).NotEmpty().WithMessage("Brand name is required.")
                            .MaximumLength(100).WithMessage("Brand name must not exceed 100 characters.");

        RuleFor(v => v.CountryOfOrigin).NotEmpty().WithMessage("Country of origin is required.");
    }
}