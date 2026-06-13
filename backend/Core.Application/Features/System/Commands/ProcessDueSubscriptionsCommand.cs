using Core.Application.Interfaces.Repositories;
using Core.Application.Interfaces.Services;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Financials;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.System;
using Core.Domain.Entities.Users;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.System.Commands;

public class ProcessDueSubscriptionsCommand : IRequest<Unit>
{
}

public class ProcessDueSubscriptionsCommandHandler : IRequestHandler<ProcessDueSubscriptionsCommand, Unit>
{
    private readonly IGenericRepository<ProductSubscription> _subscriptionRepository;
    private readonly IGenericRepository<SubscriptionItem> _subscriptionItemRepository;
    private readonly IGenericRepository<UserProfile> _userProfileRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IGenericRepository<Order> _orderRepository;
    private readonly IGenericRepository<WalletTransaction> _walletTransactionRepository;
    private readonly IStockNotificationService _stockNotificationService;
    private readonly IUnitOfWork _unitOfWork;

    public ProcessDueSubscriptionsCommandHandler(
        IGenericRepository<ProductSubscription> subscriptionRepository,
        IGenericRepository<SubscriptionItem> subscriptionItemRepository,
        IGenericRepository<UserProfile> userProfileRepository,
        IGenericRepository<Product> productRepository,
        IGenericRepository<Order> orderRepository,
        IGenericRepository<WalletTransaction> walletTransactionRepository,
        IStockNotificationService stockNotificationService,
        IUnitOfWork unitOfWork)
    {
        _subscriptionRepository = subscriptionRepository;
        _subscriptionItemRepository = subscriptionItemRepository;
        _userProfileRepository = userProfileRepository;
        _productRepository = productRepository;
        _orderRepository = orderRepository;
        _walletTransactionRepository = walletTransactionRepository;
        _stockNotificationService = stockNotificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(ProcessDueSubscriptionsCommand request, CancellationToken cancellationToken)
    {
        var dueSubscriptions = (await _subscriptionRepository.FindAsync(s =>
            s.IsActive && s.NextDeliveryDate <= DateTime.UtcNow)).ToList();

        foreach (var subscription in dueSubscriptions)
        {
            try
            {
                var items = (await _subscriptionItemRepository.FindAsync(i => i.SubscriptionId == subscription.Id)).ToList();
                subscription.Items = items;

                await ProcessSingleSubscriptionAsync(subscription, cancellationToken);
            }
            catch (Exception)
            {
                continue;
            }
        }

        return Unit.Value;
    }

    private async Task ProcessSingleSubscriptionAsync(ProductSubscription subscription, CancellationToken cancellationToken)
    {
        var userProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == subscription.UserId);
        if (userProfile == null) return;

        decimal totalAmount = 0;
        var orderItems = new List<OrderItem>();
        var updatedStocks = new List<(Guid ProductId, int NewStock)>();

        foreach (var item in subscription.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product == null || product.StockQuantity < item.Quantity)
                throw new Exception("Insufficient stock for subscription items.");

            decimal unitPrice = product.DiscountPrice ?? product.Price;
            totalAmount += unitPrice * item.Quantity;

            product.StockQuantity -= item.Quantity;
            _productRepository.Update(product);

            updatedStocks.Add((product.Id, product.StockQuantity));

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = unitPrice
            });
        }

        if (userProfile.WalletBalance < totalAmount)
        {
            subscription.IsActive = false;
            _subscriptionRepository.Update(subscription);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return;
        }

        userProfile.WalletBalance -= totalAmount;
        _userProfileRepository.Update(userProfile);

        var orderId = Guid.NewGuid();
        var walletTx = new WalletTransaction
        {
            UserId = subscription.UserId,
            Amount = totalAmount,
            Type = TransactionType.Withdrawal,
            Description = $"Auto-renewal deduction for Subscription #{subscription.Id}",
            ReferenceOrderId = orderId
        };
        await _walletTransactionRepository.AddAsync(walletTx);

        var order = new Order
        {
            Id = orderId,
            UserId = subscription.UserId,
            TotalAmount = totalAmount,
            FinalAmount = totalAmount,
            ShippingAddress = subscription.ShippingAddress,
            PaymentMethod = PaymentMethod.Wallet,
            Status = OrderStatus.Processing,
            PaymentStatus = PaymentStatus.Paid,
            Items = orderItems
        };
        await _orderRepository.AddAsync(order);

        subscription.NextDeliveryDate = DateTime.UtcNow.AddDays(subscription.FrequencyInDays);
        _subscriptionRepository.Update(subscription);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        
        foreach (var stock in updatedStocks)
        {
            await _stockNotificationService.NotifyStockUpdateAsync(stock.ProductId, stock.NewStock);
        }
    }
}