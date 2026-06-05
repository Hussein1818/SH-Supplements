using Core.Domain.Common;

namespace Core.Domain.Entities.Users;

public class Address : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public UserProfile UserProfile { get; set; } = null!;

    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;

    // Indicates if this is the default shipping address
    public bool IsDefault { get; set; }
}