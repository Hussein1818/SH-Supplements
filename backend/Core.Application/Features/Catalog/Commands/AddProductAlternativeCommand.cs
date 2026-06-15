using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class AddProductAlternativeCommand : IRequest<Guid>
{
    public Guid ProductId { get; set; }
    public Guid AlternativeProductId { get; set; }
}

public class AddProductAlternativeCommandHandler : IRequestHandler<AddProductAlternativeCommand, Guid>
{
    private readonly IGenericRepository<ProductAlternative> _alternativeRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddProductAlternativeCommandHandler(
        IGenericRepository<ProductAlternative> alternativeRepository,
        IGenericRepository<Product> productRepository,
        IUnitOfWork unitOfWork)
    {
        _alternativeRepository = alternativeRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(AddProductAlternativeCommand request, CancellationToken cancellationToken)
    {
        if (request.ProductId == request.AlternativeProductId)
            throw new BadRequestException("A product cannot be an alternative to itself.");

        var productExists = await _productRepository.AnyAsync(p => p.Id == request.ProductId);
        var altExists = await _productRepository.AnyAsync(p => p.Id == request.AlternativeProductId);

        if (!productExists || !altExists)
            throw new NotFoundException(nameof(Product), $"{request.ProductId} or {request.AlternativeProductId}");

        var alreadyLinked = await _alternativeRepository.AnyAsync(pa =>
            pa.ProductId == request.ProductId && pa.AlternativeProductId == request.AlternativeProductId);

        if (alreadyLinked)
            throw new ConflictException("These products are already linked as alternatives.");

        var productAlternative = new ProductAlternative
        {
            ProductId = request.ProductId,
            AlternativeProductId = request.AlternativeProductId
        };

        await _alternativeRepository.AddAsync(productAlternative);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return productAlternative.Id;
    }
}