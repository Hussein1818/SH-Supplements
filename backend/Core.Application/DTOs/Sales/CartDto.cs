using System;
using System.Collections.Generic;
using System.Linq;

namespace Core.Application.DTOs.Sales;

public class CartDto
{
    public Guid Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public ICollection<CartItemDto> Items { get; set; } = new List<CartItemDto>();

    public decimal GrandTotal => Items.Sum(i => i.TotalPrice);

    
    public decimal RemainingForFreeShipping { get; set; }
    public bool IsFreeShippingEligible => RemainingForFreeShipping <= 0;
}