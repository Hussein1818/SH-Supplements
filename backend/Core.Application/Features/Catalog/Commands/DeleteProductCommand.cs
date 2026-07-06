using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class DeleteProductCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, bool>
{
    private readonly IGenericRepository<Product> _productRepo;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductCommandHandler(IGenericRepository<Product> productRepo, IUnitOfWork unitOfWork)
    {
        _productRepo = productRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepo.GetByIdAsync(request.Id);
        if (product == null) throw new NotFoundException(nameof(Product), request.Id);

        _productRepo.Delete(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}