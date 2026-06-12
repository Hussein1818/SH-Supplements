using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using MediatR;
using System;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Commands;

public class RemoveFromCartCommand : IRequest<Unit>
{
    public Guid CartItemId { get; set; }

    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class RemoveFromCartCommandHandler : IRequestHandler<RemoveFromCartCommand, Unit>
{
    private readonly IGenericRepository<CartItem> _cartItemRepository;
    private readonly IGenericRepository<Cart> _cartRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveFromCartCommandHandler(
        IGenericRepository<CartItem> cartItemRepository,
        IGenericRepository<Cart> cartRepository,
        IUnitOfWork unitOfWork)
    {
        _cartItemRepository = cartItemRepository;
        _cartRepository = cartRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(RemoveFromCartCommand request, CancellationToken cancellationToken)
    {
        var cartItem = await _cartItemRepository.GetByIdAsync(request.CartItemId);
        if (cartItem == null)
            throw new NotFoundException(nameof(CartItem), request.CartItemId);

        
        var cart = await _cartRepository.GetByIdAsync(cartItem.CartId);
        if (cart == null || cart.UserId != request.UserId)
            throw new ConflictException("You do not have permission to delete this cart item.");

        _cartItemRepository.Delete(cartItem);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}