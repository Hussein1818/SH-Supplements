using FluentValidation;
using Core.Application.Features.Auth.Commands;

namespace Core.Application.Features.Auth.Validators;

public class AssignTrainerRoleCommandValidator : AbstractValidator<AssignTrainerRoleCommand>
{
    public AssignTrainerRoleCommandValidator()
    {
        RuleFor(v => v.UserId)
            .NotEmpty().WithMessage("User ID is required to assign a role.");
    }
}