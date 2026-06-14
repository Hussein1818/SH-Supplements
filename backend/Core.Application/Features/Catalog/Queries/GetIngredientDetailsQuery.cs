using Core.Application.DTOs.Catalog;
using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Queries;

public class GetIngredientDetailsQuery : IRequest<IngredientGlossaryDto>
{
    public string IngredientName { get; set; } = string.Empty;
}

public class GetIngredientDetailsQueryHandler : IRequestHandler<GetIngredientDetailsQuery, IngredientGlossaryDto>
{
    private readonly IGenericRepository<IngredientGlossary> _glossaryRepository;

    public GetIngredientDetailsQueryHandler(IGenericRepository<IngredientGlossary> glossaryRepository)
    {
        _glossaryRepository = glossaryRepository;
    }

    public async Task<IngredientGlossaryDto> Handle(GetIngredientDetailsQuery request, CancellationToken cancellationToken)
    {
        var ingredient = await _glossaryRepository.FirstOrDefaultAsync(
            ig => ig.IngredientName.ToLower() == request.IngredientName.ToLower());

        if (ingredient == null)
            throw new NotFoundException(nameof(IngredientGlossary), request.IngredientName);

        return new IngredientGlossaryDto
        {
            IngredientName = ingredient.IngredientName,
            ScientificBenefit = ingredient.ScientificBenefit,
            PotentialWarnings = ingredient.PotentialWarnings
        };
    }
}