using Core.Application.Features.Catalog.Commands;
using FluentValidation;

namespace Core.Application.Features.Catalog.Validators;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(v => v.Name).NotEmpty().WithMessage("Category name is required.")
                            .MaximumLength(100).WithMessage("Category name must not exceed 100 characters.");
    }
}