using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class AddIngredientGlossaryCommand : IRequest<Guid>
{
    public string IngredientName { get; set; } = string.Empty;
    public string ScientificBenefit { get; set; } = string.Empty;
    public string? PotentialWarnings { get; set; }
}

public class AddIngredientGlossaryCommandHandler : IRequestHandler<AddIngredientGlossaryCommand, Guid>
{
    private readonly IGenericRepository<IngredientGlossary> _glossaryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddIngredientGlossaryCommandHandler(
        IGenericRepository<IngredientGlossary> glossaryRepository,
        IUnitOfWork unitOfWork)
    {
        _glossaryRepository = glossaryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(AddIngredientGlossaryCommand request, CancellationToken cancellationToken)
    {

        var existingIngredient = await _glossaryRepository.FirstOrDefaultAsync(
            ig => ig.IngredientName.ToLower() == request.IngredientName.ToLower());

        if (existingIngredient != null)
            throw new ConflictException($"The ingredient '{request.IngredientName}' already exists in the glossary.");

        var glossary = new IngredientGlossary
        {
            IngredientName = request.IngredientName,
            ScientificBenefit = request.ScientificBenefit,
            PotentialWarnings = request.PotentialWarnings
        };

        await _glossaryRepository.AddAsync(glossary);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return glossary.Id;
    }
}