using FluentValidation;
using Core.Application.Features.Catalog.Commands;

namespace Core.Application.Features.Catalog.Validators;

public class AddProductSerialNumbersCommandValidator : AbstractValidator<AddProductSerialNumbersCommand>
{
    public AddProductSerialNumbersCommandValidator()
    {
        RuleFor(v => v.ProductId)
            .NotEmpty().WithMessage("Product ID is required.");

        RuleFor(v => v.SerialNumbers)
            .NotEmpty().WithMessage("You must provide at least one serial number.")
            .Must(list => list != null && list.Count > 0).WithMessage("Serial numbers list cannot be empty.");
    }
}