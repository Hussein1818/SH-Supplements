using Core.Application.Features.Sales.Commands;
using Core.Application.Features.Sales.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] 
public class CartsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CartsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("my-cart")]
    public async Task<IActionResult> GetMyCart()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        var query = new GetActiveCartQuery { UserId = userId };
        var cart = await _mediator.Send(query);

        return Ok(cart);
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartCommand command)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        
        command.UserId = userId;

        var cartId = await _mediator.Send(command);
        return Ok(new { Message = "Product added to cart successfully.", CartId = cartId });
    }

    [HttpPut("update-quantity")]
    public async Task<IActionResult> UpdateQuantity([FromBody] UpdateCartItemQuantityCommand command)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        
        command.UserId = userId;

        await _mediator.Send(command);
        return Ok(new { Message = "Cart item quantity updated successfully." });
    }

    [HttpDelete("remove/{cartItemId}")]
    public async Task<IActionResult> RemoveFromCart(Guid cartItemId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        
        var command = new RemoveFromCartCommand
        {
            CartItemId = cartItemId,
            UserId = userId
        };

        await _mediator.Send(command);
        return Ok(new { Message = "Item removed from cart successfully." });
    }
}