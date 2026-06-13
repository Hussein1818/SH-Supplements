using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class CreateStockNotificationCommand : IRequest<Guid>
{
    [JsonIgnore] 
    public string UserId { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
}

public class CreateStockNotificationCommandHandler : IRequestHandler<CreateStockNotificationCommand, Guid>
{
    private readonly IGenericRepository<StockNotificationRequest> _notificationRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateStockNotificationCommandHandler(
        IGenericRepository<StockNotificationRequest> notificationRepository,
        IGenericRepository<Product> productRepository,
        IUnitOfWork unitOfWork)
    {
        _notificationRepository = notificationRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateStockNotificationCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId);
        if (product == null)
            throw new NotFoundException(nameof(Product), request.ProductId);

        if (product.StockQuantity > 0)
            throw new BadRequestException("This product is already in stock.");

       
        var existingRequest = await _notificationRepository.FirstOrDefaultAsync(
            n => n.UserId == request.UserId && n.ProductId == request.ProductId && !n.IsNotified);

        if (existingRequest != null)
            return existingRequest.Id;

        var notificationRequest = new StockNotificationRequest
        {
            UserId = request.UserId,
            ProductId = request.ProductId,
            IsNotified = false
        };

        await _notificationRepository.AddAsync(notificationRequest);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return notificationRequest.Id;
    }
}