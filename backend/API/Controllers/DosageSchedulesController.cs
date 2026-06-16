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
public class DosageSchedulesController : ControllerBase
{
    private readonly IMediator _mediator;

    public DosageSchedulesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("my-schedule")]
    public async Task<IActionResult> GetMySchedule()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var query = new GetUserDosageScheduleQuery { UserId = userId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPatch("{productId}/toggle-email-reminder")]
    public async Task<IActionResult> ToggleEmailReminder(Guid productId, [FromBody] bool enableEmail)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new ToggleEmailReminderCommand
        {
            UserId = userId,
            ProductId = productId,
            EnableEmail = enableEmail
        };
        await _mediator.Send(command);
        return Ok(new { Message = "Email reminder settings updated successfully." });
    }
    [HttpDelete("{productId}")]
    public async Task<IActionResult> DeleteSchedule(Guid productId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new DeleteUserDosageScheduleCommand
        {
            UserId = userId,
            ProductId = productId
        };

        await _mediator.Send(command);
        return Ok(new { Message = "Product dosage schedule has been removed successfully." });
    }
}