using Core.Application.DTOs.Catalog;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Queries;

public class GetAllActiveIngredientsQuery : IRequest<List<ActiveIngredientDto>>
{
}

public class GetAllActiveIngredientsQueryHandler : IRequestHandler<GetAllActiveIngredientsQuery, List<ActiveIngredientDto>>
{
    private readonly IGenericRepository<ActiveIngredient> _ingredientRepository;

    public GetAllActiveIngredientsQueryHandler(IGenericRepository<ActiveIngredient> ingredientRepository)
    {
        _ingredientRepository = ingredientRepository;
    }

    public async Task<List<ActiveIngredientDto>> Handle(GetAllActiveIngredientsQuery request, CancellationToken cancellationToken)
    {
        var ingredients = await _ingredientRepository.GetAllAsync();

        return ingredients.Select(i => new ActiveIngredientDto
        {
            Id = i.Id,
            Name = i.Name,
            MaximumSafeDailyDose = i.MaximumSafeDailyDose,
            UnitOfMeasurement = i.UnitOfMeasurement
        }).OrderBy(i => i.Name).ToList();
    }
}