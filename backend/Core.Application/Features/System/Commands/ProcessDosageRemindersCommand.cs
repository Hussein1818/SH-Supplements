using Core.Application.Interfaces.Repositories;
using Core.Application.Interfaces.Services;
using Core.Domain.Entities.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.System.Commands;

public class ProcessDosageRemindersCommand : IRequest<bool>
{
}

public class ProcessDosageRemindersCommandHandler : IRequestHandler<ProcessDosageRemindersCommand, bool>
{
    private readonly IGenericRepository<UserDosageSchedule> _scheduleRepo;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly IDosageNotificationService _notificationService;

    public ProcessDosageRemindersCommandHandler(
        IGenericRepository<UserDosageSchedule> scheduleRepo,
        UserManager<ApplicationUser> userManager,
        IEmailService emailService,
        IDosageNotificationService notificationService)
    {
        _scheduleRepo = scheduleRepo;
        _userManager = userManager;
        _emailService = emailService;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(ProcessDosageRemindersCommand request, CancellationToken cancellationToken)
    {
        var currentTime = DateTime.UtcNow.TimeOfDay;
        var startWindow = currentTime.Subtract(TimeSpan.FromMinutes(5));
        var endWindow = currentTime.Add(TimeSpan.FromMinutes(5));

        var dueSchedules = await _scheduleRepo.FindAsync(s =>
            s.ScheduledTime >= startWindow &&
            s.ScheduledTime <= endWindow);

        if (!dueSchedules.Any()) return true;

        foreach (var schedule in dueSchedules)
        {
            var user = await _userManager.FindByIdAsync(schedule.UserId);
            if (user == null) continue;

            var message = $"It's time for your {schedule.PhaseName} dose: {schedule.Instruction}!";

            await _notificationService.SendDosageReminderAsync(user.Id, message);

            if (schedule.IsEmailReminderEnabled && !string.IsNullOrEmpty(user.Email))
            {
                var emailBody = $"<h3>Time for your supplement!</h3><p>{message}</p>";
                await _emailService.SendEmailAsync(user.Email, "Supplement Dosage Reminder", emailBody);
            }
        }

        return true;
    }
}