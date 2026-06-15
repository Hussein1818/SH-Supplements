using Core.Application.Features.Sales.Commands;
using Core.Application.Features.Sales.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Core.Domain.Constants;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = Roles.Trainer)]
public class AffiliatesController : ControllerBase
{
    private readonly IMediator _mediator;

    public AffiliatesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("generate-code")]
    public async Task<IActionResult> GenerateCode([FromBody] string requestedCode)
    {

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var command = new GenerateAffiliateCodeCommand
        {
            CoachUserId = userId!,
            RequestedCode = requestedCode
        };

        var codeId = await _mediator.Send(command);

        return Ok(new { Message = "Affiliate code generated successfully.", CodeId = codeId });
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var query = new GetCoachDashboardQuery
        {
            CoachUserId = userId!
        };

        var dashboardData = await _mediator.Send(query);

        return Ok(dashboardData);
    }
}