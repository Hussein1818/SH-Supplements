using Core.Application.Features.Financials.Commands;
using Core.Application.Features.Financials.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] 
public class WalletController : ControllerBase
{
    private readonly IMediator _mediator;

    public WalletController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("charge")]
    public async Task<IActionResult> ChargeWallet([FromBody] ChargeWalletCommand command)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        
        command.UserId = userId;

        var result = await _mediator.Send(command);
        return Ok(new { Message = "Wallet charged successfully.", Transaction = result });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetWalletHistory()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        var query = new GetWalletHistoryQuery { UserId = userId };
        var history = await _mediator.Send(query);

        return Ok(history);
    }
}