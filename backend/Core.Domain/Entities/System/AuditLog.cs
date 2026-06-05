using Core.Domain.Common;

namespace Core.Domain.Entities.System;

public class AuditLog : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // e.g., "UPDATE", "DELETE"
    public string PrimaryKey { get; set; } = string.Empty;

    public string? OldValues { get; set; } // Stored as JSON
    public string? NewValues { get; set; } // Stored as JSON

    public string? AffectedColumns { get; set; } // Stored as JSON array
}