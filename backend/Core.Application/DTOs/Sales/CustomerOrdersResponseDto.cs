using System.Collections.Generic;

namespace Core.Application.DTOs.Sales;

public class CustomerOrdersResponseDto
{
    public List<OrderDto> Orders { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}