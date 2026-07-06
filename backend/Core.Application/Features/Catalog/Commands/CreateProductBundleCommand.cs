using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class CreateProductBundleCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public List<BundleItemDto> Items { get; set; } = new();
}

public class BundleItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}

public class CreateProductBundleCommandHandler : IRequestHandler<CreateProductBundleCommand, Guid>
{
    private readonly IGenericRepository<ProductBundle> _bundleRepo;
    private readonly IUnitOfWork _unitOfWork;

    public CreateProductBundleCommandHandler(IGenericRepository<ProductBundle> bundleRepo, IUnitOfWork unitOfWork)
    {
        _bundleRepo = bundleRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateProductBundleCommand request, CancellationToken cancellationToken)
    {
        var bundle = new ProductBundle
        {
            Name = request.Name,
            Description = request.Description,
            DiscountPercentage = request.DiscountPercentage,
            IsActive = true,
            Items = request.Items.Select(i => new BundleItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity
            }).ToList()
        };

        await _bundleRepo.AddAsync(bundle);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return bundle.Id;
    }
}