using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class AddProductDosageGuideCommand : IRequest<Guid>
{
    public Guid ProductId { get; set; }
    public TimeSpan RecommendedTime { get; set; }
    public string Instruction { get; set; } = string.Empty;
    public string PhaseName { get; set; } = string.Empty;
}

public class AddProductDosageGuideCommandHandler : IRequestHandler<AddProductDosageGuideCommand, Guid>
{
    private readonly IGenericRepository<ProductDosageGuide> _guideRepo;
    private readonly IGenericRepository<Product> _productRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AddProductDosageGuideCommandHandler(
        IGenericRepository<ProductDosageGuide> guideRepo,
        IGenericRepository<Product> productRepo,
        IUnitOfWork unitOfWork)
    {
        _guideRepo = guideRepo;
        _productRepo = productRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(AddProductDosageGuideCommand request, CancellationToken cancellationToken)
    {
        var productExists = await _productRepo.AnyAsync(p => p.Id == request.ProductId);
        if (!productExists) throw new NotFoundException(nameof(Product), request.ProductId);

        var exists = await _guideRepo.AnyAsync(g => g.ProductId == request.ProductId && g.RecommendedTime == request.RecommendedTime);
        if (exists) throw new ConflictException("A dosage guide for this exact time already exists for this product.");

        var guide = new ProductDosageGuide
        {
            ProductId = request.ProductId,
            RecommendedTime = request.RecommendedTime,
            Instruction = request.Instruction.Trim(),
            PhaseName = request.PhaseName.Trim()
        };

        await _guideRepo.AddAsync(guide);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return guide.Id;
    }
}