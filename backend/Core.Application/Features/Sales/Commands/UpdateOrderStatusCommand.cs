using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Financials;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.Users;
using Core.Domain.Enums;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Commands;

public class UpdateOrderStatusCommand : IRequest<Unit>
{
    public Guid OrderId { get; set; }
    public OrderStatus Status { get; set; }
}

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Unit>
{
    private readonly IGenericRepository<Order> _orderRepository;
    private readonly IGenericRepository<OrderItem> _orderItemRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IGenericRepository<UserProfile> _userProfileRepository;
    private readonly IGenericRepository<WalletTransaction> _walletTxRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateOrderStatusCommandHandler(
        IGenericRepository<Order> orderRepository,
        IGenericRepository<OrderItem> orderItemRepository,
        IGenericRepository<Product> productRepository,
        IGenericRepository<UserProfile> userProfileRepository,
        IGenericRepository<WalletTransaction> walletTxRepository,
        IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _orderItemRepository = orderItemRepository;
        _productRepository = productRepository;
        _userProfileRepository = userProfileRepository;
        _walletTxRepository = walletTxRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId);
        if (order == null)
            throw new NotFoundException(nameof(Order), request.OrderId);

        if (order.Status == OrderStatus.Cancelled && request.Status != OrderStatus.Cancelled)
            throw new BadRequestException("Cannot change the status of an already cancelled order.");

        if (request.Status == OrderStatus.Cancelled && order.Status != OrderStatus.Cancelled)
        {
            var orderItems = await _orderItemRepository.FindAsync(i => i.OrderId == order.Id);
            foreach (var item in orderItems)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product != null)
                {
                    product.StockQuantity += item.Quantity;
                    _productRepository.Update(product);
                }
            }

            if (order.PaymentStatus == PaymentStatus.Paid)
            {
                var userProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == order.UserId);
                if (userProfile != null)
                {
                    userProfile.WalletBalance += order.FinalAmount;
                    _userProfileRepository.Update(userProfile);

                    await _walletTxRepository.AddAsync(new WalletTransaction
                    {
                        UserId = order.UserId,
                        Amount = order.FinalAmount,
                        Type = TransactionType.Deposit,
                        Description = $"Refund for cancelled order #{order.Id} by Admin",
                        ReferenceOrderId = order.Id
                    });
                }
                order.PaymentStatus = PaymentStatus.Refunded;
            }
        }

        order.Status = request.Status;

        if (order.Status == OrderStatus.Delivered && order.PaymentMethod == PaymentMethod.CashOnDelivery)
        {
            order.PaymentStatus = PaymentStatus.Paid;
        }

        _orderRepository.Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}