using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class DeleteBrandCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteBrandCommandHandler : IRequestHandler<DeleteBrandCommand, bool>
{
    private readonly IGenericRepository<Brand> _brandRepo;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteBrandCommandHandler(IGenericRepository<Brand> brandRepo, IUnitOfWork unitOfWork)
    {
        _brandRepo = brandRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _brandRepo.GetByIdAsync(request.Id);
        if (brand == null) throw new NotFoundException(nameof(Brand), request.Id);

        _brandRepo.Delete(brand);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}