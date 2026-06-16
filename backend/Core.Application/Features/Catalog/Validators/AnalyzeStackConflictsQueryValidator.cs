using FluentValidation;
using Core.Application.Features.Catalog.Queries;

namespace Core.Application.Features.Catalog.Validators;

public class AnalyzeStackConflictsQueryValidator : AbstractValidator<AnalyzeStackConflictsQuery>
{
    public AnalyzeStackConflictsQueryValidator()
    {
        RuleFor(v => v.ProductIds)
            .NotEmpty().WithMessage("You must select at least one product to analyze.")
            .Must(list => list != null && list.Count >= 2).WithMessage("A stack must contain at least two products to analyze conflicts.");
    }
}