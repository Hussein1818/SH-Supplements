using Core.Application.Features.Catalog.Commands;
using FluentValidation;

namespace Core.Application.Features.Catalog.Validators;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(v => v.Name).NotEmpty().WithMessage("Product name is required.");

        RuleFor(v => v.Price).GreaterThan(0).WithMessage("Price must be greater than zero.");

        RuleFor(v => v.StockQuantity).GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be negative.");

        RuleFor(v => v.CategoryId).NotEmpty().WithMessage("Category ID is required.");

        RuleFor(v => v.BrandId).NotEmpty().WithMessage("Brand ID is required.");

        RuleFor(v => v.Goal).IsInEnum().WithMessage("Invalid User Goal value.");
    }
}