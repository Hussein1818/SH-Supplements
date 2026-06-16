using FluentValidation;
using Core.Application.Features.Users.Commands;

namespace Core.Application.Features.Users.Validators;

public class DeleteUserDosageScheduleCommandValidator : AbstractValidator<DeleteUserDosageScheduleCommand>
{
    public DeleteUserDosageScheduleCommandValidator()
    {
        RuleFor(v => v.UserId).NotEmpty().WithMessage("UserId is required.");
        RuleFor(v => v.ProductId).NotEmpty().WithMessage("ProductId is required.");
    }
}