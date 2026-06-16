using FluentValidation;
using Core.Application.Features.Users.Commands;

namespace Core.Application.Features.Users.Validators;

public class GenerateUserDosageScheduleCommandValidator : AbstractValidator<GenerateUserDosageScheduleCommand>
{
    public GenerateUserDosageScheduleCommandValidator()
    {
        RuleFor(v => v.OrderId)
            .NotEmpty().WithMessage("Order ID is required to generate a dosage schedule.");
    }
}