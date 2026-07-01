using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.Users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Commands;

public class AddBundleToCartCommand : IRequest<Guid>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;

    public Guid BundleId { get; set; }
}

public class AddBundleToCartCommandHandler : IRequestHandler<AddBundleToCartCommand, Guid>
{
    private readonly IGenericRepository<ProductBundle> _bundleRepository;
    private readonly IGenericRepository<BundleItem> _bundleItemRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IGenericRepository<Cart> _cartRepository;
    private readonly IGenericRepository<CartItem> _cartItemRepository;
    private readonly IGenericRepository<UserProfile> _userProfileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddBundleToCartCommandHandler(
        IGenericRepository<ProductBundle> bundleRepository,
        IGenericRepository<BundleItem> bundleItemRepository,
        IGenericRepository<Product> productRepository,
        IGenericRepository<Cart> cartRepository,
        IGenericRepository<CartItem> cartItemRepository,
        IGenericRepository<UserProfile> userProfileRepository,
        IUnitOfWork unitOfWork)
    {
        _bundleRepository = bundleRepository;
        _bundleItemRepository = bundleItemRepository;
        _productRepository = productRepository;
        _cartRepository = cartRepository;
        _cartItemRepository = cartItemRepository;
        _userProfileRepository = userProfileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(AddBundleToCartCommand request, CancellationToken cancellationToken)
    {
        var bundle = await _bundleRepository.GetByIdAsync(request.BundleId);
        if (bundle == null || !bundle.IsActive)
            throw new NotFoundException(nameof(ProductBundle), request.BundleId);

        var bundleItems = (await _bundleItemRepository.FindAsync(bi => bi.BundleId == bundle.Id)).ToList();
        if (!bundleItems.Any())
            throw new BadRequestException("This bundle contains no products.");

        var cart = await _cartRepository.FirstOrDefaultAsync(c => c.UserId == request.UserId);
        if (cart == null)
        {
            var userProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == request.UserId);
            if (userProfile == null)
                throw new NotFoundException(nameof(UserProfile), request.UserId);

            cart = new Cart
            {
                UserId = request.UserId,
                UserProfile = userProfile
            };
            await _cartRepository.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        foreach (var bundleItem in bundleItems)
        {
            var product = await _productRepository.GetByIdAsync(bundleItem.ProductId);

            if (product == null)
                throw new NotFoundException(nameof(Product), bundleItem.ProductId);

            if (product.StockQuantity < bundleItem.Quantity)
                throw new ConflictException($"Insufficient stock for bundle item: {product.Name}");

            decimal basePrice = product.DiscountPrice ?? product.Price;
            decimal bundleDiscountMultiplier = 1m - (bundle.DiscountPercentage / 100m);
            decimal finalUnitPrice = Math.Round(basePrice * bundleDiscountMultiplier, 2);

            var existingCartItem = await _cartItemRepository.FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == product.Id);

            if (existingCartItem != null)
            {
                existingCartItem.Quantity += bundleItem.Quantity;
                existingCartItem.UnitPrice = finalUnitPrice;
                _cartItemRepository.Update(existingCartItem);
            }
            else
            {
                var newCartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = product.Id,
                    Quantity = bundleItem.Quantity,
                    UnitPrice = finalUnitPrice
                };
                await _cartItemRepository.AddAsync(newCartItem);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return cart.Id;
    }
}