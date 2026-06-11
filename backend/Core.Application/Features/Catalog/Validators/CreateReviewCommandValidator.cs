using Core.Application.Features.Catalog.Commands;
using FluentValidation;

namespace Core.Application.Features.Catalog.Validators;

public class CreateReviewCommandValidator : AbstractValidator<CreateReviewCommand>
{
    public CreateReviewCommandValidator()
    {
        RuleFor(v => v.ProductId).NotEmpty().WithMessage("Product ID is required.");

        RuleFor(v => v.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");

        RuleFor(v => v.Comment)
            .MaximumLength(500).WithMessage("Comment must not exceed 500 characters.");
    }
}