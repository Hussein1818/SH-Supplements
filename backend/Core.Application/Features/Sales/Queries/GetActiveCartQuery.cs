using Core.Application.DTOs.Sales;
using Core.Application.Interfaces.Repositories;
using Core.Application.Settings;
using Core.Domain.Entities.Sales;
using MediatR;
using Microsoft.Extensions.Options;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Queries;

public class GetActiveCartQuery : IRequest<CartDto>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class GetActiveCartQueryHandler : IRequestHandler<GetActiveCartQuery, CartDto>
{
    private readonly IGenericRepository<Cart> _cartRepository;
    private readonly OrderSettings _orderSettings;

    public GetActiveCartQueryHandler(
        IGenericRepository<Cart> cartRepository,
        IOptions<OrderSettings> orderSettings)
    {
        _cartRepository = cartRepository;
        _orderSettings = orderSettings.Value;
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
                    ProductImageUrl = i.Product.Images.Where(img => img.IsMainImage).Select(img => img.ImageUrl).FirstOrDefault() ?? string.Empty,
                    UnitPrice = i.UnitPrice ?? (i.Product.DiscountPrice ?? i.Product.Price),
                    Quantity = i.Quantity,
                    TotalPrice = (i.UnitPrice ?? (i.Product.DiscountPrice ?? i.Product.Price)) * i.Quantity
                }).ToList()
            })
            .FirstOrDefault();

        if (cartDto == null)
        {
            return Task.FromResult(new CartDto { UserId = request.UserId });
        }

        
        decimal currentTotal = cartDto.GrandTotal;
        decimal threshold = _orderSettings.FreeShippingThreshold;

        cartDto.RemainingForFreeShipping = currentTotal >= threshold ? 0 : (threshold - currentTotal);

        return Task.FromResult(cartDto);
    }
}