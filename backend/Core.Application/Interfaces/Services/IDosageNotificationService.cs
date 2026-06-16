using System.Threading.Tasks;

namespace Core.Application.Interfaces.Services;

public interface IDosageNotificationService
{
    Task SendDosageReminderAsync(string userId, string message);
}