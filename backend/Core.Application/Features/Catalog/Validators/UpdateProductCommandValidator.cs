using Core.Application.Features.Catalog.Commands;
using FluentValidation;

namespace Core.Application.Features.Catalog.Validators;

public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Product ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(150).WithMessage("Product name must not exceed 150 characters.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero.");

        RuleFor(x => x.DiscountPrice)
            .LessThan(x => x.Price).When(x => x.DiscountPrice.HasValue)
            .WithMessage("Discount price must be less than the original price.");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be negative.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category ID is required.");

        RuleFor(x => x.BrandId)
            .NotEmpty().WithMessage("Brand ID is required.");

        RuleFor(x => x.Goal)
            .IsInEnum().WithMessage("Invalid user goal specified.");
    }
}