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

public class UpdateCartItemQuantityCommand : IRequest<Unit>
{
    public Guid CartItemId { get; set; }
    public int Quantity { get; set; }

    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class UpdateCartItemQuantityCommandHandler : IRequestHandler<UpdateCartItemQuantityCommand, Unit>
{
    private readonly IGenericRepository<CartItem> _cartItemRepository;
    private readonly IGenericRepository<Cart> _cartRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCartItemQuantityCommandHandler(
        IGenericRepository<CartItem> cartItemRepository,
        IGenericRepository<Cart> cartRepository,
        IGenericRepository<Product> productRepository,
        IUnitOfWork unitOfWork)
    {
        _cartItemRepository = cartItemRepository;
        _cartRepository = cartRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(UpdateCartItemQuantityCommand request, CancellationToken cancellationToken)
    {
        // 1. Get the CartItem
        var cartItem = await _cartItemRepository.GetByIdAsync(request.CartItemId);
        if (cartItem == null)
            throw new NotFoundException(nameof(CartItem), request.CartItemId);

        // 2. Ensure the Cart belongs to the requesting User
        var cart = await _cartRepository.GetByIdAsync(cartItem.CartId);
        if (cart == null || cart.UserId != request.UserId)
            throw new ConflictException("You do not have permission to modify this cart item.");

        // 3. Stock Validation
        var product = await _productRepository.GetByIdAsync(cartItem.ProductId);
        if (product == null)
            throw new NotFoundException(nameof(Product), cartItem.ProductId);

        if (product.StockQuantity < request.Quantity)
            throw new ConflictException("Not enough stock available for the requested quantity.");

        // 4. Update and Save
        cartItem.Quantity = request.Quantity;
        _cartItemRepository.Update(cartItem);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}