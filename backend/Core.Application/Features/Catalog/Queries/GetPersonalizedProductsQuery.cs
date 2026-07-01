using Core.Application.DTOs.Catalog;
using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Users;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace Core.Application.Features.Catalog.Queries;

public class GetPersonalizedProductsQuery : IRequest<List<PersonalizedProductDto>>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class GetPersonalizedProductsQueryHandler : IRequestHandler<GetPersonalizedProductsQuery, List<PersonalizedProductDto>>
{
    private readonly IGenericRepository<UserProfile> _userProfileRepository;
    private readonly IGenericRepository<Product> _productRepository;

    public GetPersonalizedProductsQueryHandler(
        IGenericRepository<UserProfile> userProfileRepository,
        IGenericRepository<Product> productRepository)
    {
        _userProfileRepository = userProfileRepository;
        _productRepository = productRepository;
    }

    public async Task<List<PersonalizedProductDto>> Handle(GetPersonalizedProductsQuery request, CancellationToken cancellationToken)
    {
        var userProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == request.UserId);
        if (userProfile == null)
            throw new NotFoundException(nameof(UserProfile), request.UserId);

        string goalDescription = userProfile.Goal.ToString();

        var personalizedProducts = _productRepository.GetQueryable()
            .Where(p => p.Goal == userProfile.Goal && p.StockQuantity > 0)
            .OrderByDescending(p => p.CreatedAt)
            .Take(10) 
            .Select(p => new PersonalizedProductDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                ImageUrl = p.Images.Where(img => img.IsMainImage).Select(img => img.ImageUrl).FirstOrDefault() ?? string.Empty,
                Price = p.DiscountPrice ?? p.Price,
                MatchReason = $"Perfect for your current {goalDescription} journey!"
            })
            .ToList();

        return personalizedProducts;
    }
}