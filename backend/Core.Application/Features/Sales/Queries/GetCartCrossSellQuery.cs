using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Sales;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.DTOs.Sales;

namespace Core.Application.Features.Sales.Queries;


public class GetCartCrossSellQuery : IRequest<List<CrossSellItemDto>>
{
    public string UserId { get; set; } = string.Empty;
}

public class GetCartCrossSellQueryHandler : IRequestHandler<GetCartCrossSellQuery, List<CrossSellItemDto>>
{
    private readonly IGenericRepository<Cart> _cartRepository;
    private readonly IGenericRepository<Product> _productRepository;

    public GetCartCrossSellQueryHandler(
        IGenericRepository<Cart> cartRepository,
        IGenericRepository<Product> productRepository)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
    }

    public Task<List<CrossSellItemDto>> Handle(GetCartCrossSellQuery request, CancellationToken cancellationToken)
    {
        
        var cartProductIds = _cartRepository.GetQueryable()
            .Where(c => c.UserId == request.UserId)
            .SelectMany(c => c.Items.Select(i => i.ProductId))
            .ToList();

        var suggestions = _productRepository.GetQueryable()
            .Where(p => p.StockQuantity > 0
                     && !cartProductIds.Contains(p.Id)
                     && (p.DiscountPrice ?? p.Price) < 500)
            .Take(3)
            .Select(p => new CrossSellItemDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                ProductImageUrl = p.Images.Where(img => img.IsMainImage).Select(img => img.ImageUrl).FirstOrDefault() ?? string.Empty,
                Price = p.DiscountPrice ?? p.Price,
                SuggestionReason = "Add this to reach free shipping!"
            })
            .ToList();

        return Task.FromResult(suggestions);
    }
}