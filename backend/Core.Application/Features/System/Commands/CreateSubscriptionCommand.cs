using Core.Application.DTOs.System;
using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.System;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.System.Commands;

public class CreateSubscriptionCommand : IRequest<Guid>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;

    
    public int FrequencyInDays { get; set; } = 30;

    public List<CreateSubscriptionItemDto> Items { get; set; } = new();
}

public class CreateSubscriptionCommandHandler : IRequestHandler<CreateSubscriptionCommand, Guid>
{
    private readonly IGenericRepository<ProductSubscription> _subscriptionRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateSubscriptionCommandHandler(
        IGenericRepository<ProductSubscription> subscriptionRepository,
        IGenericRepository<Product> productRepository,
        IUnitOfWork unitOfWork)
    {
        _subscriptionRepository = subscriptionRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateSubscriptionCommand request, CancellationToken cancellationToken)
    {
        if (request.Items.Count == 0)
            throw new BadRequestException("Subscription must contain at least one item.");

        if (request.FrequencyInDays <= 0)
            throw new BadRequestException("Frequency in days must be greater than zero.");

        var subscriptionItems = new List<SubscriptionItem>();

        foreach (var item in request.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product == null)
                throw new NotFoundException(nameof(Product), item.ProductId);

            subscriptionItems.Add(new SubscriptionItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity
            });
        }

        var subscription = new ProductSubscription
        {
            UserId = request.UserId,
            ShippingAddress = request.ShippingAddress,
            IsActive = true, 
            FrequencyInDays = request.FrequencyInDays,
            NextDeliveryDate = DateTime.UtcNow.AddDays(request.FrequencyInDays), 
            Items = subscriptionItems
        };

        await _subscriptionRepository.AddAsync(subscription);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return subscription.Id;
    }
}