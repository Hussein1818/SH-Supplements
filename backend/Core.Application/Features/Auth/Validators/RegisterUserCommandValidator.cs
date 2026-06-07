using FluentValidation;
using Core.Application.Features.Auth.Commands;

namespace Core.Application.Features.Auth.Validators;

public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(v => v.Username).NotEmpty().WithMessage("Username is required.").MinimumLength(3).WithMessage("Username must be at least 3 characters long.").MaximumLength(50).WithMessage("Username must not exceed 50 characters.");
        RuleFor(v => v.Email).NotEmpty().WithMessage("Email is required.").EmailAddress().WithMessage("A valid email address is required.").MaximumLength(150).WithMessage("Email must not exceed 150 characters.");
        RuleFor(v => v.Password).NotEmpty().WithMessage("Password is required.").MinimumLength(6).WithMessage("Password must be at least 6 characters long.");
    }
}