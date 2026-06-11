using Core.Application.Features.Catalog.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReviewsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] CreateReviewCommand command)
    {
        // Extract UserId securely from JWT Token
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        command.UserId = userId;

        var reviewId = await _mediator.Send(command);
        return Ok(new { Message = "Review added successfully.", ReviewId = reviewId });
    }
}