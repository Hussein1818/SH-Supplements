using FluentValidation;
using Core.Application.Features.Users.Commands;

namespace Core.Application.Features.Users.Validators;

public class ToggleEmailReminderCommandValidator : AbstractValidator<ToggleEmailReminderCommand>
{
    public ToggleEmailReminderCommandValidator()
    {
        RuleFor(v => v.UserId).NotEmpty().WithMessage("UserId is required.");
        RuleFor(v => v.ProductId).NotEmpty().WithMessage("ProductId is required.");
    }
}