using API.Hubs;
using Core.Application.Interfaces.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace API.Services;

public class StockNotificationService : IStockNotificationService
{
    private readonly IHubContext<StockHub> _hubContext;

    public StockNotificationService(IHubContext<StockHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyStockUpdateAsync(Guid productId, int newStockQuantity)
    {
        
        await _hubContext.Clients.All.SendAsync("ReceiveStockUpdate", productId, newStockQuantity);
    }
}