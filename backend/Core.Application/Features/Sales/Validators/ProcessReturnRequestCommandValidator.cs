using FluentValidation;
using Core.Application.Features.Sales.Commands;

namespace Core.Application.Features.Sales.Validators;

public class ProcessReturnRequestCommandValidator : AbstractValidator<ProcessReturnRequestCommand>
{
    public ProcessReturnRequestCommandValidator()
    {
        RuleFor(v => v.ReturnRequestId)
            .NotEmpty().WithMessage("Return Request ID is required.");
    }
}