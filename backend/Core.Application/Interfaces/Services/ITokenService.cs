using System.Security.Claims;

namespace Core.Application.Interfaces.Services;

public interface ITokenService
{
    
    string GenerateToken(string userId, string userName, IList<string> roles);
    string GenerateRefreshToken();
    ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
}