using Core.Domain.Common;

namespace Core.Domain.Entities.System;

public class RefreshToken : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string JwtId { get; set; } = string.Empty; 

    public DateTime ExpiryDate { get; set; }
    public bool IsUsed { get; set; }
    public bool IsRevoked { get; set; }

    public bool IsActive => !IsRevoked && !IsUsed && ExpiryDate > DateTime.UtcNow;
}