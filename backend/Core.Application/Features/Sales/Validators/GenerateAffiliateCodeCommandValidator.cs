using FluentValidation;
using Core.Application.Features.Sales.Commands;

namespace Core.Application.Features.Sales.Validators;

public class GenerateAffiliateCodeCommandValidator : AbstractValidator<GenerateAffiliateCodeCommand>
{
    public GenerateAffiliateCodeCommandValidator()
    {
        RuleFor(v => v.RequestedCode)
            .NotEmpty().WithMessage("Affiliate code cannot be empty.")
            .Matches("^[A-Za-z0-9]+$").WithMessage("Code can only contain letters and numbers, no spaces or special characters.")
            .MinimumLength(3).WithMessage("Code must be at least 3 characters long.")
            .MaximumLength(20).WithMessage("Code cannot exceed 20 characters.");
    }
}