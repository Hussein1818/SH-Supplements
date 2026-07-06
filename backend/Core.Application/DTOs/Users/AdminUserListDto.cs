namespace Core.Application.DTOs.Users;

public class AdminUserListDto
{
    public string UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public decimal WalletBalance { get; set; }
    public int LoyaltyPoints { get; set; }
    public string? ProfileImageUrl { get; set; }
}