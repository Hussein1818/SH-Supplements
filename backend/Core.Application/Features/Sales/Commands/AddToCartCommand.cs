using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.Users;
using MediatR;
using System;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Commands;

public class AddToCartCommand : IRequest<Guid>
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }

    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, Guid>
{
    private readonly IGenericRepository<Cart> _cartRepository;
    private readonly IGenericRepository<CartItem> _cartItemRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IGenericRepository<UserProfile> _userProfileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddToCartCommandHandler(
        IGenericRepository<Cart> cartRepository,
        IGenericRepository<CartItem> cartItemRepository,
        IGenericRepository<Product> productRepository,
        IGenericRepository<UserProfile> userProfileRepository,
        IUnitOfWork unitOfWork)
    {
        _cartRepository = cartRepository;
        _cartItemRepository = cartItemRepository;
        _productRepository = productRepository;
        _userProfileRepository = userProfileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId);
        if (product == null)
            throw new NotFoundException(nameof(Product), request.ProductId);

        if (product.StockQuantity < request.Quantity)
            throw new ConflictException("Not enough stock available for this product.");

        decimal finalUnitPrice = product.DiscountPrice ?? product.Price;

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

        var existingCartItem = await _cartItemRepository.FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == request.ProductId);

        if (existingCartItem != null)
        {
            var newQuantity = existingCartItem.Quantity + request.Quantity;

            if (product.StockQuantity < newQuantity)
                throw new ConflictException("Not enough stock available for the requested total quantity.");

            existingCartItem.Quantity = newQuantity;
            existingCartItem.UnitPrice = finalUnitPrice;

            _cartItemRepository.Update(existingCartItem);
        }
        else
        {
            var newCartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                UnitPrice = finalUnitPrice
            };
            await _cartItemRepository.AddAsync(newCartItem);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return cart.Id;
    }
}