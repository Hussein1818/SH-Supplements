using API.Hubs;
using Core.Application.Interfaces.Services;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace API.Services;

public class DosageNotificationService : IDosageNotificationService
{
    private readonly IHubContext<StockHub> _hubContext;

    public DosageNotificationService(IHubContext<StockHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendDosageReminderAsync(string userId, string message)
    {
        await _hubContext.Clients.User(userId).SendAsync("ReceiveDosageReminder", message);
    }
}