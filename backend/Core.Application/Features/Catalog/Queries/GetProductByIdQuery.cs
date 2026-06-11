using Core.Application.DTOs.Catalog;
using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Queries;

public class GetProductByIdQuery : IRequest<ProductDetailDto>
{
    public Guid Id { get; set; }
}

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDetailDto>
{
    private readonly IGenericRepository<Product> _productRepository;

    public GetProductByIdQueryHandler(IGenericRepository<Product> productRepository)
    {
        _productRepository = productRepository;
    }

    public Task<ProductDetailDto> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var productDto = _productRepository.GetQueryable()
            .Where(p => p.Id == request.Id)
            .Select(p => new ProductDetailDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                StockQuantity = p.StockQuantity,
                Flavor = p.Flavor,
                Servings = p.Servings,
                Ingredients = p.Ingredients,
                Warnings = p.Warnings,
                ExpiryDate = p.ExpiryDate,
                Goal = p.Goal,
                AverageRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,

                Category = p.Category != null ? new CategoryDto
                {
                    Id = p.Category.Id,
                    Name = p.Category.Name,
                    Description = p.Category.Description
                } : null!,

                Brand = p.Brand != null ? new BrandDto
                {
                    Id = p.Brand.Id,
                    Name = p.Brand.Name,
                    CountryOfOrigin = p.Brand.CountryOfOrigin
                } : null!,

                Images = p.Images.Select(i => new ProductImageDto
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl,
                    IsMainImage = i.IsMainImage
                }).ToList(),

                Reviews = p.Reviews.Select(r => new ReviewDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList()
            })
            .FirstOrDefault(); 

        if (productDto == null)
            throw new NotFoundException(nameof(Product), request.Id);

        return Task.FromResult(productDto);
    }
}