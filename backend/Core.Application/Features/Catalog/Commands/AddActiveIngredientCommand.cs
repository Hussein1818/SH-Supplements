using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class AddActiveIngredientCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public decimal MaximumSafeDailyDose { get; set; }
    public string UnitOfMeasurement { get; set; } = string.Empty;
}

public class AddActiveIngredientCommandHandler : IRequestHandler<AddActiveIngredientCommand, Guid>
{
    private readonly IGenericRepository<ActiveIngredient> _ingredientRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddActiveIngredientCommandHandler(
        IGenericRepository<ActiveIngredient> ingredientRepository,
        IUnitOfWork unitOfWork)
    {
        _ingredientRepository = ingredientRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(AddActiveIngredientCommand request, CancellationToken cancellationToken)
    {
        var formattedName = request.Name.Trim().ToLower();
        var exists = await _ingredientRepository.AnyAsync(a => a.Name.ToLower() == formattedName);

        if (exists)
            throw new ConflictException($"An active ingredient with the name '{request.Name}' already exists in the medical database.");

        var ingredient = new ActiveIngredient
        {
            Name = request.Name.Trim(),
            MaximumSafeDailyDose = request.MaximumSafeDailyDose,
            UnitOfMeasurement = request.UnitOfMeasurement.Trim()
        };

        await _ingredientRepository.AddAsync(ingredient);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ingredient.Id;
    }
}