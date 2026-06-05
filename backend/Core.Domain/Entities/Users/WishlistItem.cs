using Core.Domain.Common;
using Core.Domain.Entities.Catalog;

namespace Core.Domain.Entities.Users;

public class WishlistItem : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public UserProfile UserProfile { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
}