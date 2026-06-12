using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Sales;
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
    private readonly IUnitOfWork _unitOfWork;

    public AddToCartCommandHandler(
        IGenericRepository<Cart> cartRepository,
        IGenericRepository<CartItem> cartItemRepository,
        IGenericRepository<Product> productRepository,
        IUnitOfWork unitOfWork)
    {
        _cartRepository = cartRepository;
        _cartItemRepository = cartItemRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate Product and Stock
        var product = await _productRepository.GetByIdAsync(request.ProductId);
        if (product == null)
            throw new NotFoundException(nameof(Product), request.ProductId);

        if (product.StockQuantity < request.Quantity)
            throw new ConflictException("Not enough stock available for this product.");

        // 2. Get existing Cart for the user, or create a new one
        var cart = await _cartRepository.FirstOrDefaultAsync(c => c.UserId == request.UserId);
        if (cart == null)
        {
            cart = new Cart { UserId = request.UserId };
            await _cartRepository.AddAsync(cart);

            // Save immediately to generate a CartId for the CartItems
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // 3. Check if the product is already in the cart
        var existingCartItem = await _cartItemRepository.FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == request.ProductId);

        if (existingCartItem != null)
        {
            // Product is already in cart, just increase the quantity
            var newQuantity = existingCartItem.Quantity + request.Quantity;

            // Re-validate stock for the new total quantity
            if (product.StockQuantity < newQuantity)
                throw new ConflictException("Not enough stock available for the requested total quantity.");

            existingCartItem.Quantity = newQuantity;
            _cartItemRepository.Update(existingCartItem);
        }
        else
        {
            // Add new item to the cart
            var newCartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };
            await _cartItemRepository.AddAsync(newCartItem);
        }

        // 4. Commit all changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return cart.Id; 
    }
}