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

public class GetFlashSaleProductsQuery : IRequest<List<FlashSaleProductDto>>
{
}

public class GetFlashSaleProductsQueryHandler : IRequestHandler<GetFlashSaleProductsQuery, List<FlashSaleProductDto>>
{
    private readonly IGenericRepository<Product> _productRepository;

    public GetFlashSaleProductsQueryHandler(IGenericRepository<Product> productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<List<FlashSaleProductDto>> Handle(GetFlashSaleProductsQuery request, CancellationToken cancellationToken)
    {
        var flashSaleProducts = await _productRepository.FindAsync(p => p.IsFlashSale && p.StockQuantity > 0);

        return flashSaleProducts.Select(p =>
        {
            var originalPrice = p.Price;
            var discountPrice = p.DiscountPrice ?? p.Price;
            var savings = originalPrice > 0 ? Math.Round(((originalPrice - discountPrice) / originalPrice) * 100, 1) : 0;

            return new FlashSaleProductDto
            {
                Id = p.Id,
                Name = p.Name,
                OriginalPrice = originalPrice,
                DiscountPrice = discountPrice,
                SavingsPercentage = savings,
                StockQuantity = p.StockQuantity,
                ExpiryDate = p.ExpiryDate,
                ImageUrl = p.Images?.FirstOrDefault(i => i.IsMainImage)?.ImageUrl ?? string.Empty
            };
        }).OrderBy(p => p.ExpiryDate).ToList();
    }
}