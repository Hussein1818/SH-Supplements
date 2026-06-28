using Core.Application.Features.Auth.Commands;
using Core.Application.Features.Auth.Queries;
using Core.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddDays(7),
            Secure = true,
            SameSite = SameSiteMode.None
        };
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
    {
        var userId = await _mediator.Send(command);
        return Ok(new { Message = "User registered successfully. Please check your email to confirm your account.", UserId = userId });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginQuery query)
    {
        var authResponse = await _mediator.Send(query);

        SetRefreshTokenCookie(authResponse.RefreshToken);

        return Ok(new { Token = authResponse.Token });
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] ConfirmEmailCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { Message = "Email confirmed successfully. Now you can login." });
    }

    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmationEmailCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { Message = "If the email is registered and not confirmed, a confirmation link has been sent." });
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { Message = "Refresh token is missing from cookies." });

        var command = new RefreshTokenCommand { RefreshToken = refreshToken };
        var authResponse = await _mediator.Send(command);

        SetRefreshTokenCookie(authResponse.RefreshToken);

        return Ok(new { Token = authResponse.Token });
    }

    [Authorize]
    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        await _mediator.Send(new RevokeTokenCommand { UserId = userId });

        Response.Cookies.Delete("refreshToken");

        return Ok(new { Message = "Token revoked successfully." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
    {
        command.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

        var success = await _mediator.Send(command);
        if (!success)
            return BadRequest(new { Message = "Invalid current password." });

        return Ok(new { Message = "Password updated successfully." });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { Message = "If the email is registered and confirmed, a password reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { Message = "Password has been reset successfully." });
    }

    [HttpPost("{id}/assign-trainer")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> AssignTrainerRole(string id)
    {
        var command = new AssignTrainerRoleCommand { UserId = id };
        await _mediator.Send(command);

        return Ok(new { Message = "User has been successfully upgraded to Trainer." });
    }

    [HttpPost("{id}/revoke-trainer")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> RevokeTrainerRole(string id)
    {
        var command = new RevokeTrainerRoleCommand { UserId = id };
        await _mediator.Send(command);

        return Ok(new { Message = "Trainer role has been revoked and their affiliate code is deactivated." });
    }
}