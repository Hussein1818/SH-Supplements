using Core.Application.DTOs.Auth;
using Core.Application.Exceptions;
using Core.Application.Interfaces.Services;
using Core.Domain.Entities.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Auth.Commands;

public class RefreshTokenCommand : IRequest<AuthResponseDto>
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponseDto>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public RefreshTokenCommandHandler(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
       
        var user = _userManager.Users.FirstOrDefault(u => u.RefreshToken == request.RefreshToken);

        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new BadRequestException("Invalid or expired refresh token.");
        }

        var roles = await _userManager.GetRolesAsync(user);

        var newAccessToken = _tokenService.GenerateToken(user.Id, user.UserName ?? string.Empty, roles);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        await _userManager.UpdateAsync(user);

        return new AuthResponseDto
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken
        };
    }
}

public class RevokeTokenCommand : IRequest<bool>
{
    public string UserId { get; set; } = string.Empty;
}

public class RevokeTokenCommandHandler : IRequestHandler<RevokeTokenCommand, bool>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public RevokeTokenCommandHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<bool> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null) return false;

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;
        await _userManager.UpdateAsync(user);

        return true;
    }
}