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

public class GetProductDosageGuidesQuery : IRequest<List<ProductDosageGuideDto>>
{
    public Guid ProductId { get; set; }
}

public class GetProductDosageGuidesQueryHandler : IRequestHandler<GetProductDosageGuidesQuery, List<ProductDosageGuideDto>>
{
    private readonly IGenericRepository<ProductDosageGuide> _guideRepo;

    public GetProductDosageGuidesQueryHandler(IGenericRepository<ProductDosageGuide> guideRepo)
    {
        _guideRepo = guideRepo;
    }

    public async Task<List<ProductDosageGuideDto>> Handle(GetProductDosageGuidesQuery request, CancellationToken cancellationToken)
    {
        var guides = await _guideRepo.FindAsync(g => g.ProductId == request.ProductId);

        return guides.Select(g => new ProductDosageGuideDto
        {
            RecommendedTime = g.RecommendedTime,
            Instruction = g.Instruction,
            PhaseName = g.PhaseName
        }).OrderBy(g => g.RecommendedTime).ToList();
    }
}