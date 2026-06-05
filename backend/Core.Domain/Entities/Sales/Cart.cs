using Core.Domain.Common;
using Core.Domain.Entities.Users;

namespace Core.Domain.Entities.Sales;

public class Cart : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public UserProfile UserProfile { get; set; } = null!;

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

