using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class AddProductActiveIngredientCommand : IRequest<Guid>
{
    public Guid ProductId { get; set; }
    public Guid ActiveIngredientId { get; set; }
    public decimal AmountPerServing { get; set; }
}

public class AddProductActiveIngredientCommandHandler : IRequestHandler<AddProductActiveIngredientCommand, Guid>
{
    private readonly IGenericRepository<ProductActiveIngredient> _productIngredientRepo;
    private readonly IGenericRepository<Product> _productRepo;
    private readonly IGenericRepository<ActiveIngredient> _ingredientRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AddProductActiveIngredientCommandHandler(
        IGenericRepository<ProductActiveIngredient> productIngredientRepo,
        IGenericRepository<Product> productRepo,
        IGenericRepository<ActiveIngredient> ingredientRepo,
        IUnitOfWork unitOfWork)
    {
        _productIngredientRepo = productIngredientRepo;
        _productRepo = productRepo;
        _ingredientRepo = ingredientRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(AddProductActiveIngredientCommand request, CancellationToken cancellationToken)
    {
        var productExists = await _productRepo.AnyAsync(p => p.Id == request.ProductId);
        if (!productExists)
            throw new NotFoundException(nameof(Product), request.ProductId);

        var ingredientExists = await _ingredientRepo.AnyAsync(a => a.Id == request.ActiveIngredientId);
        if (!ingredientExists)
            throw new NotFoundException(nameof(ActiveIngredient), request.ActiveIngredientId);

        var alreadyExists = await _productIngredientRepo.AnyAsync(pi =>
            pi.ProductId == request.ProductId && pi.ActiveIngredientId == request.ActiveIngredientId);

        if (alreadyExists)
            throw new ConflictException("This active ingredient is already linked to this product.");

        var productIngredient = new ProductActiveIngredient
        {
            ProductId = request.ProductId,
            ActiveIngredientId = request.ActiveIngredientId,
            AmountPerServing = request.AmountPerServing
        };

        await _productIngredientRepo.AddAsync(productIngredient);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return productIngredient.Id;
    }
}