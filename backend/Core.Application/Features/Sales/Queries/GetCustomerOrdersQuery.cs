using Core.Application.DTOs.Sales;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Queries;

public class GetCustomerOrdersQuery : IRequest<List<OrderDto>>
{
    public string UserId { get; set; } = string.Empty;
}

public class GetCustomerOrdersQueryHandler : IRequestHandler<GetCustomerOrdersQuery, List<OrderDto>>
{
    private readonly IGenericRepository<Order> _orderRepository;

    public GetCustomerOrdersQueryHandler(IGenericRepository<Order> orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public Task<List<OrderDto>> Handle(GetCustomerOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = _orderRepository.GetQueryable()
            .Where(o => o.UserId == request.UserId)
            .OrderByDescending(o => o.CreatedAt) 
            .Select(o => new OrderDto
            {
                Id = o.Id,
                OrderDate = o.CreatedAt, 
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                DiscountAmount = o.DiscountAmount,
                FinalAmount = o.FinalAmount,
                ShippingAddress = o.ShippingAddress,
                TrackingNumber = o.TrackingNumber,
                PaymentMethod = o.PaymentMethod,
                PaymentStatus = o.PaymentStatus,
                Items = o.Items.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductImageUrl = i.Product.Images.Where(img => img.IsMainImage).Select(img => img.ImageUrl).FirstOrDefault() ?? string.Empty,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            })
            .ToList(); 

        return Task.FromResult(orders);
    }
}