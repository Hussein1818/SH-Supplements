using Core.Application.Features.Health.Commands;
using Core.Application.Features.Health.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class HealthController : ControllerBase
{
    private readonly IMediator _mediator;

    public HealthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("metrics/calculate-and-save")]
    public async Task<IActionResult> CalculateAndSaveMetrics([FromBody] CalculateHealthMetricsCommand command)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        
        command.UserId = userId;

        var resultId = await _mediator.Send(command);
        return Ok(new { Message = "Health metrics calculated and saved successfully.", RecordId = resultId });
    }

    [HttpGet("metrics/history")]
    public async Task<IActionResult> GetMetricsHistory()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        var query = new GetUserHealthMetricsHistoryQuery { UserId = userId };
        var history = await _mediator.Send(query);

        return Ok(history);
    }

    [HttpGet("progress-tracker")]
    [Authorize]
    public async Task<IActionResult> GetHealthProgress()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var query = new GetUserHealthProgressQuery { UserId = userId! };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
    [HttpPost("measurements")]
    [Authorize]
    public async Task<IActionResult> AddMeasurement([FromBody] AddHealthMeasurementCommand command)
    {
        command.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var recordId = await _mediator.Send(command);
        return Ok(new { Message = "Measurement added successfully.", RecordId = recordId });
    }
}