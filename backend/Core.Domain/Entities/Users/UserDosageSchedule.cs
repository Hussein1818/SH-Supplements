using Core.Domain.Common;
using Core.Domain.Entities.Catalog;
using System;

namespace Core.Domain.Entities.Users;

public class UserDosageSchedule : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public UserProfile UserProfile { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public TimeSpan ScheduledTime { get; set; }
    public string Instruction { get; set; } = string.Empty;
    public string PhaseName { get; set; } = string.Empty;

    // Opt-in for email notifications
    public bool IsEmailReminderEnabled { get; set; } = false;
}