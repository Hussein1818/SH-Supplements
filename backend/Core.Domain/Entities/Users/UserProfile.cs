using Core.Domain.Common;
using Core.Domain.Entities.Sales;
using Core.Domain.Enums;

namespace Core.Domain.Entities.Users;

public class UserProfile : BaseEntity
{
    public string UserId { get; set; } = string.Empty; 
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;

    
    public int Age { get; set; }
    public decimal Weight { get; set; }
    public decimal Height { get; set; }
    public UserGoal Goal { get; set; }
    public string? MedicalConditions { get; set; } 

    
    public decimal WalletBalance { get; set; } = 0;
    public int LoyaltyPoints { get; set; } = 0;

    public ICollection<Address> Addresses { get; set; } = new List<Address>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}