using Core.Application.Features.Auth.Commands;
using Core.Application.Features.System.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        var query = new GetDashboardStatisticsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("create-admin")]
    public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminCommand command)
    {
        var adminId = await _mediator.Send(command);
        return Ok(new { Message = "New admin created successfully.", AdminId = adminId });
    }
}