using Core.Application.DTOs.Catalog;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Queries;

public class AnalyzeStackConflictsQuery : IRequest<StackAnalysisResultDto>
{
    public List<Guid> ProductIds { get; set; } = new List<Guid>();
}

public class AnalyzeStackConflictsQueryHandler : IRequestHandler<AnalyzeStackConflictsQuery, StackAnalysisResultDto>
{
    private readonly IGenericRepository<ProductActiveIngredient> _productIngredientRepo;
    private readonly IGenericRepository<ActiveIngredient> _activeIngredientRepo;

    public AnalyzeStackConflictsQueryHandler(
        IGenericRepository<ProductActiveIngredient> productIngredientRepo,
        IGenericRepository<ActiveIngredient> activeIngredientRepo)
    {
        _productIngredientRepo = productIngredientRepo;
        _activeIngredientRepo = activeIngredientRepo;
    }

    public async Task<StackAnalysisResultDto> Handle(AnalyzeStackConflictsQuery request, CancellationToken cancellationToken)
    {
        var result = new StackAnalysisResultDto { IsSafe = true };

        var productIngredients = await _productIngredientRepo.FindAsync(pi => request.ProductIds.Contains(pi.ProductId));

        if (!productIngredients.Any())
            return result; 

        var ingredientIds = productIngredients.Select(pi => pi.ActiveIngredientId).Distinct().ToList();
        var activeIngredients = await _activeIngredientRepo.FindAsync(ai => ingredientIds.Contains(ai.Id));

        foreach (var ai in activeIngredients)
        {
            var totalAmountInStack = productIngredients
                .Where(pi => pi.ActiveIngredientId == ai.Id)
                .Sum(pi => pi.AmountPerServing);

            var exceedsLimit = totalAmountInStack > ai.MaximumSafeDailyDose;

            if (exceedsLimit)
            {
                result.IsSafe = false;
                result.Warnings.Add($"Warning: The total amount of {ai.Name} in this stack is {totalAmountInStack}{ai.UnitOfMeasurement}, which exceeds the maximum safe daily dose of {ai.MaximumSafeDailyDose}{ai.UnitOfMeasurement}. We strongly recommend swapping one of the products for a stimulant-free alternative.");
            }

            result.IngredientTotals.Add(new IngredientTotalDto
            {
                IngredientName = ai.Name,
                TotalAmount = totalAmountInStack,
                MaximumSafeDose = ai.MaximumSafeDailyDose,
                Unit = ai.UnitOfMeasurement,
                ExceedsSafeLimit = exceedsLimit
            });
        }

        return result;
    }
}