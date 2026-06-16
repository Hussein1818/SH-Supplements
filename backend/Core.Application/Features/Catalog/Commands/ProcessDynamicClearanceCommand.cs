using Core.Application.Interfaces.Repositories;
using Core.Application.Interfaces.Services;
using Core.Application.Settings;
using Core.Domain.Entities.Catalog;
using MediatR;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class ProcessDynamicClearanceCommand : IRequest<bool>
{
}

public class ProcessDynamicClearanceCommandHandler : IRequestHandler<ProcessDynamicClearanceCommand, bool>
{
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFlashSaleNotificationService _notificationService;
    private readonly ClearanceSettings _clearanceSettings;

    public ProcessDynamicClearanceCommandHandler(
        IGenericRepository<Product> productRepository,
        IUnitOfWork unitOfWork,
        IFlashSaleNotificationService notificationService,
        IOptions<ClearanceSettings> clearanceSettings)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _clearanceSettings = clearanceSettings.Value;
    }

    public async Task<bool> Handle(ProcessDynamicClearanceCommand request, CancellationToken cancellationToken)
    {
        var currentDate = DateTime.UtcNow;
        var stageOneLimit = currentDate.AddMonths(_clearanceSettings.StageOneMonthsThreshold);

        var productsToCheck = await _productRepository.FindAsync(p =>
            p.StockQuantity > 0 &&
            p.ExpiryDate <= stageOneLimit);

        if (!productsToCheck.Any())
            return true;

        foreach (var product in productsToCheck)
        {
            var monthsUntilExpiry = ((product.ExpiryDate.Year - currentDate.Year) * 12) + product.ExpiryDate.Month - currentDate.Month;

            bool priceUpdated = false;

            if (monthsUntilExpiry <= _clearanceSettings.StageTwoMonthsThreshold)
            {
                var discountAmount = product.Price * (_clearanceSettings.StageTwoDiscountPercentage / 100);
                product.DiscountPrice = product.Price - discountAmount;
                product.IsFlashSale = true;
                priceUpdated = true;
            }
            else if (monthsUntilExpiry <= _clearanceSettings.StageOneMonthsThreshold)
            {
                var discountAmount = product.Price * (_clearanceSettings.StageOneDiscountPercentage / 100);
                product.DiscountPrice = product.Price - discountAmount;
                priceUpdated = true;
            }

            if (priceUpdated)
            {
                _productRepository.Update(product);

                await _notificationService.NotifyFlashSaleUpdateAsync(
                    product.Id,
                    product.DiscountPrice ?? product.Price,
                    product.IsFlashSale);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}