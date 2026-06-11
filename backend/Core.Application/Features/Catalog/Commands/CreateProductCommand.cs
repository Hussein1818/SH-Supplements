using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class CreateProductCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }

    public string Flavor { get; set; } = string.Empty;
    public int Servings { get; set; }
    public string Ingredients { get; set; } = string.Empty;
    public string Warnings { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }

    public UserGoal Goal { get; set; }
    public Guid CategoryId { get; set; }
    public Guid BrandId { get; set; }
}

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Guid>
{
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IGenericRepository<Category> _categoryRepository;
    private readonly IGenericRepository<Brand> _brandRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateProductCommandHandler(
        IGenericRepository<Product> productRepository,
        IGenericRepository<Category> categoryRepository,
        IGenericRepository<Brand> brandRepository,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate if the Category exists
        var categoryExists = await _categoryRepository.GetByIdAsync(request.CategoryId) != null;
        if (!categoryExists)
            throw new NotFoundException(nameof(Category), request.CategoryId);

        // 2. Validate if the Brand exists
        var brandExists = await _brandRepository.GetByIdAsync(request.BrandId) != null;
        if (!brandExists)
            throw new NotFoundException(nameof(Brand), request.BrandId);

        // 3. Create the Product entity
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            Flavor = request.Flavor,
            Servings = request.Servings,
            Ingredients = request.Ingredients,
            Warnings = request.Warnings,
            ExpiryDate = request.ExpiryDate,
            Goal = request.Goal,
            CategoryId = request.CategoryId,
            BrandId = request.BrandId
        };

        // 4. Save to Database
        await _productRepository.AddAsync(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return product.Id;
    }
}