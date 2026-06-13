using System;
using System.Threading.Tasks;

namespace Core.Application.Interfaces.Services;

public interface IStockNotificationService
{
    Task NotifyStockUpdateAsync(Guid productId, int newStockQuantity);
}