using Core.Domain.Enums;
using System.Collections.Generic;

namespace Core.Application.DTOs.Users;

public class UserProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int Age { get; set; }
    public decimal Weight { get; set; }
    public decimal Height { get; set; }
    public UserGoal Goal { get; set; }
    public string? MedicalConditions { get; set; }
    public decimal WalletBalance { get; set; }
    public string? ProfileImageUrl { get; set; }
    public List<AddressDto> Addresses { get; set; } = new();
}