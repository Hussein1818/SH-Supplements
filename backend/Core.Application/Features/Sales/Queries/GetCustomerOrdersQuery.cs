using Core.Application.DTOs.Sales;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using MediatR;
using System;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Queries;

public class GetCustomerOrdersQuery : IRequest<CustomerOrdersResponseDto>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;

    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class GetCustomerOrdersQueryHandler : IRequestHandler<GetCustomerOrdersQuery, CustomerOrdersResponseDto>
{
    private readonly IGenericRepository<Order> _orderRepository;

    public GetCustomerOrdersQueryHandler(IGenericRepository<Order> orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public Task<CustomerOrdersResponseDto> Handle(GetCustomerOrdersQuery request, CancellationToken cancellationToken)
    {
        var baseQuery = _orderRepository.GetQueryable()
            .Where(o => o.UserId == request.UserId);

        var totalCount = baseQuery.Count();
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var orders = baseQuery
            .OrderByDescending(o => o.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
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

        var response = new CustomerOrdersResponseDto
        {
            Orders = orders,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };

        return Task.FromResult(response);
    }
}