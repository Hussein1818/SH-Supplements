using FluentValidation;
using Core.Application.Features.Health.Commands;

namespace Core.Application.Features.Health.Validators;

public class AddHealthMeasurementCommandValidator : AbstractValidator<AddHealthMeasurementCommand>
{
    public AddHealthMeasurementCommandValidator()
    {
        RuleFor(v => v.Weight)
            .GreaterThan(0).WithMessage("Weight must be greater than zero.")
            .LessThan(400).WithMessage("Weight value is invalid.");

        RuleFor(v => v.BodyFatPercentage)
            .InclusiveBetween(1, 70).When(v => v.BodyFatPercentage.HasValue)
            .WithMessage("Body fat percentage must be between 1 and 70.");

        RuleFor(v => v.MuscleMassPercentage)
            .InclusiveBetween(1, 90).When(v => v.MuscleMassPercentage.HasValue)
            .WithMessage("Muscle mass percentage must be between 1 and 90.");
    }
}