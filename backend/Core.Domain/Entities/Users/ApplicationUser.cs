using Microsoft.AspNetCore.Identity;
using System;

namespace Core.Domain.Entities.Users;

public class ApplicationUser : IdentityUser
{
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
}