using Core.Application.DTOs.Catalog;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Queries;

public class GetProductsQuery : IRequest<List<ProductListDto>>
{
    public string? SearchTerm { get; set; }
    public Guid? CategoryId { get; set; }
    public UserGoal? Goal { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Flavor { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
}

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, List<ProductListDto>>
{
    private readonly IGenericRepository<Product> _productRepository;

    public GetProductsQueryHandler(IGenericRepository<Product> productRepository)
    {
        _productRepository = productRepository;
    }

    public Task<List<ProductListDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _productRepository.GetQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(p => p.Name.Contains(request.SearchTerm));
        }

        if (request.CategoryId.HasValue && request.CategoryId != Guid.Empty)
        {
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);
        }

        if (request.Goal.HasValue)
        {
            query = query.Where(p => p.Goal == request.Goal.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Flavor))
        {
            query = query.Where(p => p.Flavor.Contains(request.Flavor));
        }

        if (request.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= request.MinPrice.Value);
        }

        if (request.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= request.MaxPrice.Value);
        }

        var pagedProducts = query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductListDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                Goal = p.Goal,
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                BrandName = p.Brand != null ? p.Brand.Name : string.Empty,
                AverageRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,
                MainImageUrl = p.Images.Where(i => i.IsMainImage).Select(i => i.ImageUrl).FirstOrDefault() ?? string.Empty,

                InStock = p.StockQuantity > 0
            })
            .ToList();

        return Task.FromResult(pagedProducts);
    }
}