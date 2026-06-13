using FluentValidation;
using Core.Application.Features.Financials.Commands;

namespace Core.Application.Features.Financials.Validators;

public class ChargeWalletCommandValidator : AbstractValidator<ChargeWalletCommand>
{
    public ChargeWalletCommandValidator()
    {
        RuleFor(v => v.Amount)
            .GreaterThan(0).WithMessage("Deposit amount must be greater than zero.")
            .LessThanOrEqualTo(50000).WithMessage("Maximum deposit amount per transaction is 50,000.");
    }
}