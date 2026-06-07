using Core.Application.DTOs.Auth;
using Core.Application.Interfaces.Services;
using Core.Domain.Entities.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Threading;
using System.Threading.Tasks;


namespace Core.Application.Features.Auth.Queries;

public class LoginQuery : IRequest<AuthResponseDto>
{
    public string UsernameOrEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginQueryHandler : IRequestHandler<LoginQuery, AuthResponseDto>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public LoginQueryHandler(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        ApplicationUser? user = null;

        if (request.UsernameOrEmail.Contains('@'))
        {
            user = await _userManager.FindByEmailAsync(request.UsernameOrEmail);
        }
        else
        {
            user = await _userManager.FindByNameAsync(request.UsernameOrEmail);
        }

        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!await _userManager.IsEmailConfirmedAsync(user))
            throw new UnauthorizedAccessException("Please confirm your email before logging in.");

        var roles = await _userManager.GetRolesAsync(user);

        var token = _tokenService.GenerateToken(user.Id, user.UserName ?? string.Empty, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken
        };
    }
}