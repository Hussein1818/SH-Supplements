using API.Hubs;
using Core.Application.Interfaces.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace API.Services;

public class FlashSaleNotificationService : IFlashSaleNotificationService
{
    private readonly IHubContext<StockHub> _hubContext;

    public FlashSaleNotificationService(IHubContext<StockHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyFlashSaleUpdateAsync(Guid productId, decimal newDiscountPrice, bool isFlashSale)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveFlashSaleUpdate", productId, newDiscountPrice, isFlashSale);
    }
}