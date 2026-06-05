using Core.Domain.Common;
using Core.Domain.Entities.Users;

namespace Core.Domain.Entities.System;

public class Notification : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public UserProfile UserProfile { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }

    public string? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
}