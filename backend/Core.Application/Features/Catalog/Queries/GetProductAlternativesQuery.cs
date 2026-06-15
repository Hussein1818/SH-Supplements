using Core.Application.DTOs.Catalog;
using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Queries;

public class GetProductAlternativesQuery : IRequest<List<ProductAlternativeDto>>
{
    public Guid ProductId { get; set; }
}

public class GetProductAlternativesQueryHandler : IRequestHandler<GetProductAlternativesQuery, List<ProductAlternativeDto>>
{
    private readonly IGenericRepository<ProductAlternative> _alternativeRepository;
    private readonly IGenericRepository<Product> _productRepository;

    public GetProductAlternativesQueryHandler(
        IGenericRepository<ProductAlternative> alternativeRepository,
        IGenericRepository<Product> productRepository)
    {
        _alternativeRepository = alternativeRepository;
        _productRepository = productRepository;
    }

    public async Task<List<ProductAlternativeDto>> Handle(GetProductAlternativesQuery request, CancellationToken cancellationToken)
    {
        var originalProduct = await _productRepository.GetByIdAsync(request.ProductId);
        if (originalProduct == null)
            throw new NotFoundException(nameof(Product), request.ProductId);

        var originalPrice = originalProduct.DiscountPrice ?? originalProduct.Price;

        var alternatives = await _alternativeRepository.FindAsync(a => a.ProductId == request.ProductId);
        var alternativeIds = alternatives.Select(a => a.AlternativeProductId).ToList();

        if (!alternativeIds.Any()) return new List<ProductAlternativeDto>();

        var alternativeProducts = await _productRepository.FindAsync(p => alternativeIds.Contains(p.Id) && p.StockQuantity > 0);

        var result = alternativeProducts.Select(p =>
        {
            var altPrice = p.DiscountPrice ?? p.Price;
            var savings = originalPrice > 0 ? Math.Round(((originalPrice - altPrice) / originalPrice) * 100, 1) : 0;

            return new ProductAlternativeDto
            {
                AlternativeProductId = p.Id,
                Name = p.Name,
                Price = altPrice,
                ImageUrl = p.Images?.FirstOrDefault(i => i.IsMainImage)?.ImageUrl ?? string.Empty,
                SavingsPercentage = savings > 0 ? savings : 0,
                RecommendationMessage = savings > 0 ? $"Smart Choice! You save {savings}% by choosing this local alternative." : "Alternative option with similar ingredients."
            };
        }).OrderByDescending(x => x.SavingsPercentage).ToList();

        return result;
    }
}