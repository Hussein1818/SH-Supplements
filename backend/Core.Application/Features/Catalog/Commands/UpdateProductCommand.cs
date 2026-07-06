using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class UpdateProductCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int StockQuantity { get; set; }
    public string Flavor { get; set; } = string.Empty;
    public int Servings { get; set; }
    public string Ingredients { get; set; } = string.Empty;
    public string Warnings { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public Guid CategoryId { get; set; }
    public Guid BrandId { get; set; }
    public UserGoal Goal { get; set; }
}

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, bool>
{
    private readonly IGenericRepository<Product> _productRepo;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductCommandHandler(IGenericRepository<Product> productRepo, IUnitOfWork unitOfWork)
    {
        _productRepo = productRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepo.GetByIdAsync(request.Id);
        if (product == null) throw new NotFoundException(nameof(Product), request.Id);

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.DiscountPrice = request.DiscountPrice;
        product.StockQuantity = request.StockQuantity;
        product.Flavor = request.Flavor;
        product.Servings = request.Servings;
        product.Ingredients = request.Ingredients;
        product.Warnings = request.Warnings;
        product.ExpiryDate = request.ExpiryDate;
        product.CategoryId = request.CategoryId;
        product.BrandId = request.BrandId;
        product.Goal = request.Goal;

        _productRepo.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}