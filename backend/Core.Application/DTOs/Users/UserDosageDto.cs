using System;

namespace Core.Application.DTOs.Users;

public class UserDosageDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public TimeSpan ScheduledTime { get; set; }
    public string Instruction { get; set; } = string.Empty;
    public string PhaseName { get; set; } = string.Empty;
    public bool IsEmailReminderEnabled { get; set; }
}