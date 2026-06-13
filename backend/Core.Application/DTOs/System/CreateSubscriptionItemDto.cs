using System;

namespace Core.Application.DTOs.System;

public class CreateSubscriptionItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}