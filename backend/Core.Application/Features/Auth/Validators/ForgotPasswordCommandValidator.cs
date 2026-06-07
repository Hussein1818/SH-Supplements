using FluentValidation;
using Core.Application.Features.Auth.Commands;

namespace Core.Application.Features.Auth.Validators;

public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator()
    {
        RuleFor(v => v.Email).NotEmpty().WithMessage("Email is required.").EmailAddress().WithMessage("A valid email address is required.");
    }
}