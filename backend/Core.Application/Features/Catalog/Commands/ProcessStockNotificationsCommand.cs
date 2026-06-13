using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.System;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;


public class ProcessStockNotificationsCommand : IRequest<Unit>
{
}

public class ProcessStockNotificationsCommandHandler : IRequestHandler<ProcessStockNotificationsCommand, Unit>
{
    private readonly IGenericRepository<StockNotificationRequest> _stockNotificationRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IGenericRepository<Notification> _systemNotificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProcessStockNotificationsCommandHandler(
        IGenericRepository<StockNotificationRequest> stockNotificationRepository,
        IGenericRepository<Product> productRepository,
        IGenericRepository<Notification> systemNotificationRepository,
        IUnitOfWork unitOfWork)
    {
        _stockNotificationRepository = stockNotificationRepository;
        _productRepository = productRepository;
        _systemNotificationRepository = systemNotificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(ProcessStockNotificationsCommand request, CancellationToken cancellationToken)
    {
       
        var pendingRequests = (await _stockNotificationRepository.FindAsync(n => !n.IsNotified)).ToList();

        if (!pendingRequests.Any())
            return Unit.Value;

        var productIds = pendingRequests.Select(r => r.ProductId).Distinct().ToList();

        var restockedProducts = (await _productRepository.FindAsync(p => productIds.Contains(p.Id) && p.StockQuantity > 0)).ToList();
        var restockedProductIds = restockedProducts.Select(p => p.Id).ToList();

        var notificationsToProcess = pendingRequests.Where(r => restockedProductIds.Contains(r.ProductId)).ToList();

        foreach (var req in notificationsToProcess)
        {
            var product = restockedProducts.First(p => p.Id == req.ProductId);

            var notification = new Notification
            {
                
                UserId = req.UserId,
                Title = "Item Back in Stock!",
                Message = $"{product.Name} is now back in stock. Hurry and grab yours before it runs out!"
            };

            await _systemNotificationRepository.AddAsync(notification);

            req.IsNotified = true;
            _stockNotificationRepository.Update(req);
        }

        if (notificationsToProcess.Any())
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);

        }

        return Unit.Value;
    }
}