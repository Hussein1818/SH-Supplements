using Core.Application.Features.Catalog.Commands;
using FluentValidation;
using System.Linq;

namespace Core.Application.Features.Catalog.Validators;

public class CreateProductBundleCommandValidator : AbstractValidator<CreateProductBundleCommand>
{
    public CreateProductBundleCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Bundle name is required.")
            .MaximumLength(150).WithMessage("Bundle name must not exceed 150 characters.");

        RuleFor(x => x.DiscountPercentage)
            .GreaterThanOrEqualTo(0).WithMessage("Discount percentage cannot be negative.")
            .LessThan(100).WithMessage("Discount percentage must be less than 100.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("A bundle must contain at least one item.")
            .Must(items => items != null && items.Any()).WithMessage("Items list cannot be empty.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty().WithMessage("Product ID is required.");
            item.RuleFor(i => i.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than zero.");
        });
    }
}