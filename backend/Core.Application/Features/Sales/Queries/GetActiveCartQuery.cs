using Core.Application.DTOs.Sales;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Queries;

public class GetActiveCartQuery : IRequest<CartDto>
{
    public string UserId { get; set; } = string.Empty;
}

public class GetActiveCartQueryHandler : IRequestHandler<GetActiveCartQuery, CartDto>
{
    private readonly IGenericRepository<Cart> _cartRepository;

    public GetActiveCartQueryHandler(IGenericRepository<Cart> cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public Task<CartDto> Handle(GetActiveCartQuery request, CancellationToken cancellationToken)
    {
        var cartDto = _cartRepository.GetQueryable()
            .Where(c => c.UserId == request.UserId)
            .Select(c => new CartDto
            {
                Id = c.Id,
                UserId = c.UserId,
                Items = c.Items.Select(i => new CartItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,

                    // Retrieve main image safely
                    ProductImageUrl = i.Product.Images.Where(img => img.IsMainImage).Select(img => img.ImageUrl).FirstOrDefault() ?? string.Empty,

                    // Prioritize DiscountPrice if available, otherwise fallback to Price
                    UnitPrice = i.Product.DiscountPrice ?? i.Product.Price,
                    Quantity = i.Quantity,

                    // Subtotal per item
                    TotalPrice = (i.Product.DiscountPrice ?? i.Product.Price) * i.Quantity
                }).ToList()
            })
            .FirstOrDefault();

        
        if (cartDto == null)
        {
            return Task.FromResult(new CartDto { UserId = request.UserId });
        }

        return Task.FromResult(cartDto);
    }
}