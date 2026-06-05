using Core.Domain.Common;
using Core.Domain.Entities.Users;

namespace Core.Domain.Entities.Catalog;

public class Review : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string UserId { get; set; } = string.Empty;
    public UserProfile UserProfile { get; set; } = null!;

    // Rating out of 5
    public int Rating { get; set; }
    public string? Comment { get; set; }
}