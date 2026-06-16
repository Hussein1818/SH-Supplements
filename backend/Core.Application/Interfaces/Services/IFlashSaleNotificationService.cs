using System;
using System.Threading.Tasks;

namespace Core.Application.Interfaces.Services;

public interface IFlashSaleNotificationService
{
    Task NotifyFlashSaleUpdateAsync(Guid productId, decimal newDiscountPrice, bool isFlashSale);
}