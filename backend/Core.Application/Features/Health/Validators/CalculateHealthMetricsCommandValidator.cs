using FluentValidation;
using Core.Application.Features.Health.Commands;

namespace Core.Application.Features.Health.Validators;

public class CalculateHealthMetricsCommandValidator : AbstractValidator<CalculateHealthMetricsCommand>
{
    public CalculateHealthMetricsCommandValidator()
    {
        RuleFor(v => v.Weight)
            .GreaterThan(0).WithMessage("Weight must be greater than zero.")
            .LessThan(500).WithMessage("Please enter a valid weight in kilograms.");

        RuleFor(v => v.Height)
            .GreaterThan(0).WithMessage("Height must be greater than zero.")
            .LessThan(300).WithMessage("Please enter a valid height in centimeters.");

        RuleFor(v => v.Age)
            .GreaterThan(0).WithMessage("Age must be greater than zero.")
            .LessThan(120).WithMessage("Please enter a valid age.");

        RuleFor(v => v.Gender)
            .IsInEnum().WithMessage("Invalid gender selection.");

        RuleFor(v => v.ActivityLevel)
            .IsInEnum().WithMessage("Invalid activity level selection.");
    }
}