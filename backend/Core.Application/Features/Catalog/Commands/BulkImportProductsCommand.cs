using Core.Application.Features.Catalog.DTOs;
using MediatR;
using System.Collections.Generic;
using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class BulkImportProductsCommand : IRequest<int>
{
    public List<ProductImportDto> Products { get; set; } = new List<ProductImportDto>();
}

public class BulkImportProductsCommandHandler : IRequestHandler<BulkImportProductsCommand, int>
{
    private readonly IGenericRepository<Product> _productRepo;
    private readonly IGenericRepository<Category> _categoryRepo;
    private readonly IGenericRepository<Brand> _brandRepo;
    private readonly IGenericRepository<ActiveIngredient> _activeIngredientRepo;
    private readonly IGenericRepository<ProductActiveIngredient> _productActiveIngredientRepo;
    private readonly IGenericRepository<ProductDosageGuide> _dosageGuideRepo;
    private readonly IGenericRepository<ProductImage> _productImageRepo;
    private readonly IUnitOfWork _unitOfWork;

    public BulkImportProductsCommandHandler(
        IGenericRepository<Product> productRepo,
        IGenericRepository<Category> categoryRepo,
        IGenericRepository<Brand> brandRepo,
        IGenericRepository<ActiveIngredient> activeIngredientRepo,
        IGenericRepository<ProductActiveIngredient> productActiveIngredientRepo,
        IGenericRepository<ProductDosageGuide> dosageGuideRepo,
        IGenericRepository<ProductImage> productImageRepo,
        IUnitOfWork unitOfWork)
    {
        _productRepo = productRepo;
        _categoryRepo = categoryRepo;
        _brandRepo = brandRepo;
        _activeIngredientRepo = activeIngredientRepo;
        _productActiveIngredientRepo = productActiveIngredientRepo;
        _dosageGuideRepo = dosageGuideRepo;
        _productImageRepo = productImageRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(BulkImportProductsCommand request, CancellationToken cancellationToken)
    {
        if (request.Products == null || !request.Products.Any())
            return 0;

        var existingCategories = (await _categoryRepo.GetAllAsync()).ToDictionary(c => c.Name.ToLower(), c => c);
        var existingBrands = (await _brandRepo.GetAllAsync()).ToDictionary(b => b.Name.ToLower(), b => b);
        var existingIngredients = (await _activeIngredientRepo.GetAllAsync()).ToDictionary(i => i.Name.ToLower(), i => i);

        var categoriesToInsert = new List<Category>();
        var brandsToInsert = new List<Brand>();
        var activeIngredientsToInsert = new List<ActiveIngredient>();

        var productsToInsert = new List<Product>();
        var productActiveIngredientsToInsert = new List<ProductActiveIngredient>();
        var dosageGuidesToInsert = new List<ProductDosageGuide>();
        var imagesToInsert = new List<ProductImage>();

        foreach (var dto in request.Products)
        {
            var catNameLower = dto.CategoryName.Trim().ToLower();
            if (!existingCategories.TryGetValue(catNameLower, out var category))
            {
                category = new Category
                {
                    Id = Guid.NewGuid(),
                    Name = dto.CategoryName.Trim(),
                    Description = dto.CategoryDescription
                };
                existingCategories[catNameLower] = category;
                categoriesToInsert.Add(category);
            }

            var brandNameLower = dto.BrandName.Trim().ToLower();
            if (!existingBrands.TryGetValue(brandNameLower, out var brand))
            {
                brand = new Brand
                {
                    Id = Guid.NewGuid(),
                    Name = dto.BrandName.Trim(),
                    CountryOfOrigin = dto.BrandCountryOfOrigin
                };
                existingBrands[brandNameLower] = brand;
                brandsToInsert.Add(brand);
            }

            var productId = Guid.NewGuid();
            var product = new Product
            {
                Id = productId,
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                DiscountPrice = dto.DiscountPrice,
                StockQuantity = dto.StockQuantity,
                Flavor = dto.Flavor,
                Servings = dto.Servings,
                Ingredients = dto.Ingredients,
                Warnings = dto.Warnings,
                ExpiryDate = dto.ExpiryDate,
                IsFlashSale = dto.IsFlashSale,
                Goal = dto.Goal,
                CategoryId = category.Id,
                BrandId = brand.Id
            };
            productsToInsert.Add(product);

            foreach (var aiDto in dto.ActiveIngredients)
            {
                var ingredientNameLower = aiDto.Name.Trim().ToLower();
                if (!existingIngredients.TryGetValue(ingredientNameLower, out var activeIngredient))
                {
                    activeIngredient = new ActiveIngredient
                    {
                        Id = Guid.NewGuid(),
                        Name = aiDto.Name.Trim(),
                        MaximumSafeDailyDose = aiDto.MaximumSafeDailyDose,
                        UnitOfMeasurement = aiDto.UnitOfMeasurement
                    };
                    existingIngredients[ingredientNameLower] = activeIngredient;
                    activeIngredientsToInsert.Add(activeIngredient);
                }

                productActiveIngredientsToInsert.Add(new ProductActiveIngredient
                {
                    Id = Guid.NewGuid(),
                    ProductId = productId,
                    ActiveIngredientId = activeIngredient.Id,
                    AmountPerServing = aiDto.AmountPerServing
                });
            }

            foreach (var guideDto in dto.DosageGuides)
            {
                dosageGuidesToInsert.Add(new ProductDosageGuide
                {
                    Id = Guid.NewGuid(),
                    ProductId = productId,
                    RecommendedTime = guideDto.RecommendedTime,
                    Instruction = guideDto.Instruction,
                    PhaseName = guideDto.PhaseName
                });
            }

            foreach (var imgDto in dto.Images)
            {
                imagesToInsert.Add(new ProductImage
                {
                    Id = Guid.NewGuid(),
                    ProductId = productId,
                    ImageUrl = imgDto.ImageUrl,
                    IsMainImage = imgDto.IsMainImage
                });
            }
        }

        if (categoriesToInsert.Any()) await _categoryRepo.AddRangeAsync(categoriesToInsert);
        if (brandsToInsert.Any()) await _brandRepo.AddRangeAsync(brandsToInsert);
        if (activeIngredientsToInsert.Any()) await _activeIngredientRepo.AddRangeAsync(activeIngredientsToInsert);

        await _productRepo.AddRangeAsync(productsToInsert);

        if (productActiveIngredientsToInsert.Any()) await _productActiveIngredientRepo.AddRangeAsync(productActiveIngredientsToInsert);
        if (dosageGuidesToInsert.Any()) await _dosageGuideRepo.AddRangeAsync(dosageGuidesToInsert);
        if (imagesToInsert.Any()) await _productImageRepo.AddRangeAsync(imagesToInsert);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return productsToInsert.Count;
    }
}