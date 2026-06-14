using Core.Application.Features.Users.Commands;
using Core.Application.Features.Users.Queries;
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
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;

    public UserController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var result = await _mediator.Send(new GetUserProfileQuery { UserId = userId });

        return Ok(result);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileCommand command)
    {
        command.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        await _mediator.Send(command);

        return Ok(new { Message = "Profile updated successfully." });
    }

    [HttpPost("address")]
    public async Task<IActionResult> AddAddress([FromBody] AddAddressCommand command)
    {
        command.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        await _mediator.Send(command);

        return Ok(new { Message = "Address added successfully." });
    }

    [HttpPut("address/{id}/set-default")]
    public async Task<IActionResult> SetDefaultAddress(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        await _mediator.Send(new SetDefaultAddressCommand { UserId = userId, AddressId = id });

        return Ok(new { Message = "Default address updated successfully." });
    }
    [Authorize]
    [HttpGet("addresses")]
    public async Task<IActionResult> GetUserAddresses()
    {
       
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        var query = new GetUserAddressesQuery { UserId = userId };
        var addresses = await _mediator.Send(query);

        return Ok(addresses);
    }
    [HttpGet("loyalty-points")]
    [Authorize]
    public async Task<IActionResult> GetMyLoyaltyPoints()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var points = await _mediator.Send(new GetUserLoyaltyPointsQuery { UserId = userId });
        return Ok(new { Points = points });
    }
}