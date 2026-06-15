using FluentValidation;
using Core.Application.Features.Auth.Commands;

namespace Core.Application.Features.Auth.Validators;

public class RevokeTrainerRoleCommandValidator : AbstractValidator<RevokeTrainerRoleCommand>
{
    public RevokeTrainerRoleCommandValidator()
    {
        RuleFor(v => v.UserId)
            .NotEmpty().WithMessage("User ID is required to revoke a role.");
    }
}