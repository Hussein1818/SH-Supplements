using Core.Application.Features.Sales.Commands;
using Core.Application.Features.Sales.Queries;
using Core.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] 
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CreateOrderCommand command)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        
        command.UserId = userId;

        var orderId = await _mediator.Send(command);
        return Ok(new { Message = "Order created successfully.", OrderId = orderId });
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        var query = new GetCustomerOrdersQuery { UserId = userId };
        var orders = await _mediator.Send(query);

        return Ok(orders);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("update-status")]
    public async Task<IActionResult> UpdateOrderStatus([FromBody] UpdateOrderStatusCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { Message = "Order status updated successfully." });
    }
}