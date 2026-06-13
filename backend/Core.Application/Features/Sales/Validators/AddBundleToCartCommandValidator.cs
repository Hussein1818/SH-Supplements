using FluentValidation;

namespace Core.Application.Features.Sales.Commands;

public class AddBundleToCartCommandValidator : AbstractValidator<AddBundleToCartCommand>
{
    public AddBundleToCartCommandValidator()
    {
        RuleFor(v => v.BundleId)
            .NotEmpty().WithMessage("Bundle ID is required.");
    }
}