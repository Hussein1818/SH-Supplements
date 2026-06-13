using Core.Domain.Common;
using Core.Domain.Entities.Users;
using System;

namespace Core.Domain.Entities.Catalog;

public class StockNotificationRequest : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public UserProfile UserProfile { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public bool IsNotified { get; set; } = false;
}