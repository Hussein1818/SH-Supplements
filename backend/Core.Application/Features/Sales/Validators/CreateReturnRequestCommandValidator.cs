using FluentValidation;
using Core.Application.Features.Sales.Commands;

namespace Core.Application.Features.Sales.Validators;

public class CreateReturnRequestCommandValidator : AbstractValidator<CreateReturnRequestCommand>
{
    public CreateReturnRequestCommandValidator()
    {
        RuleFor(v => v.OrderId).NotEmpty().WithMessage("Order ID is required.");
        RuleFor(v => v.Reason).NotEmpty().WithMessage("Return reason is required.");
    }
}