using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.Users;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Users.Commands;

public class GenerateUserDosageScheduleCommand : IRequest<bool>
{
    public Guid OrderId { get; set; }
}

public class GenerateUserDosageScheduleCommandHandler : IRequestHandler<GenerateUserDosageScheduleCommand, bool>
{
    private readonly IGenericRepository<Order> _orderRepo;
    private readonly IGenericRepository<OrderItem> _orderItemRepo; 
    private readonly IGenericRepository<ProductDosageGuide> _guideRepo;
    private readonly IGenericRepository<UserDosageSchedule> _scheduleRepo;
    private readonly IUnitOfWork _unitOfWork;

    public GenerateUserDosageScheduleCommandHandler(
        IGenericRepository<Order> orderRepo,
        IGenericRepository<OrderItem> orderItemRepo,
        IGenericRepository<ProductDosageGuide> guideRepo,
        IGenericRepository<UserDosageSchedule> scheduleRepo,
        IUnitOfWork unitOfWork)
    {
        _orderRepo = orderRepo;
        _orderItemRepo = orderItemRepo;
        _guideRepo = guideRepo;
        _scheduleRepo = scheduleRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(GenerateUserDosageScheduleCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepo.FirstOrDefaultAsync(o => o.Id == request.OrderId);
        if (order == null) return false;

        var orderItems = await _orderItemRepo.FindAsync(i => i.OrderId == request.OrderId);
        if (!orderItems.Any()) return false;

        var productIds = orderItems.Select(i => i.ProductId).Distinct().ToList();

        var dosageGuides = await _guideRepo.FindAsync(g => productIds.Contains(g.ProductId));
        if (!dosageGuides.Any()) return true;

        var existingSchedules = await _scheduleRepo.FindAsync(s => s.UserId == order.UserId);
        var existingProductIds = existingSchedules.Select(s => s.ProductId).ToList();

        foreach (var guide in dosageGuides)
        {
            if (!existingProductIds.Contains(guide.ProductId))
            {
                var newSchedule = new UserDosageSchedule
                {
                    UserId = order.UserId,
                    ProductId = guide.ProductId,
                    ScheduledTime = guide.RecommendedTime,
                    Instruction = guide.Instruction,
                    PhaseName = guide.PhaseName,
                    IsEmailReminderEnabled = false
                };
                await _scheduleRepo.AddAsync(newSchedule);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}