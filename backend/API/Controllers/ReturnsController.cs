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
public class ReturnsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReturnsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("request")]
    public async Task<IActionResult> RequestReturn([FromBody] CreateReturnRequestCommand command)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        
        command.UserId = userId;

        var returnRequestId = await _mediator.Send(command);
        return Ok(new { Message = "Return request submitted successfully.", ReturnRequestId = returnRequestId });
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("update-status")]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateReturnStatusCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { Message = "Return status updated successfully." });
    }
    [HttpGet("all")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetAllReturns([FromQuery] GetAllReturnRequestsQuery query)
    {
        var returns = await _mediator.Send(query);
        return Ok(returns);
    }
}