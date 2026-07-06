using Core.Application.DTOs.Catalog;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Queries;

public class GetAllProductBundlesQuery : IRequest<List<ProductBundleDto>>
{
}

public class GetAllProductBundlesQueryHandler : IRequestHandler<GetAllProductBundlesQuery, List<ProductBundleDto>>
{
    private readonly IGenericRepository<ProductBundle> _bundleRepo;
    private readonly IGenericRepository<BundleItem> _bundleItemRepo;
    private readonly IGenericRepository<Product> _productRepo;

    public GetAllProductBundlesQueryHandler(
        IGenericRepository<ProductBundle> bundleRepo,
        IGenericRepository<BundleItem> bundleItemRepo,
        IGenericRepository<Product> productRepo)
    {
        _bundleRepo = bundleRepo;
        _bundleItemRepo = bundleItemRepo;
        _productRepo = productRepo;
    }

    public async Task<List<ProductBundleDto>> Handle(GetAllProductBundlesQuery request, CancellationToken cancellationToken)
    {
        var bundles = await _bundleRepo.GetAllAsync();
        var bundleIds = bundles.Select(b => b.Id).ToList();

        var bundleItems = await _bundleItemRepo.FindAsync(bi => bundleIds.Contains(bi.BundleId));
        var productIds = bundleItems.Select(bi => bi.ProductId).Distinct().ToList();

        var products = await _productRepo.FindAsync(p => productIds.Contains(p.Id));
        var productDict = products.ToDictionary(p => p.Id, p => p.Name);

        var result = bundles.Select(b => new ProductBundleDto
        {
            Id = b.Id,
            Name = b.Name,
            Description = b.Description,
            DiscountPercentage = b.DiscountPercentage,
            IsActive = b.IsActive,
            Items = bundleItems.Where(bi => bi.BundleId == b.Id).Select(bi => new BundleItemResponseDto
            {
                ProductId = bi.ProductId,
                ProductName = productDict.TryGetValue(bi.ProductId, out var name) ? name : "Unknown Product",
                Quantity = bi.Quantity
            }).ToList()
        }).ToList();

        return result;
    }
}