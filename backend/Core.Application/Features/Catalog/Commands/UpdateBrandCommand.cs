using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class UpdateBrandCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CountryOfOrigin { get; set; } = string.Empty;
}

public class UpdateBrandCommandHandler : IRequestHandler<UpdateBrandCommand, bool>
{
    private readonly IGenericRepository<Brand> _brandRepo;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateBrandCommandHandler(IGenericRepository<Brand> brandRepo, IUnitOfWork unitOfWork)
    {
        _brandRepo = brandRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _brandRepo.GetByIdAsync(request.Id);
        if (brand == null) throw new NotFoundException(nameof(Brand), request.Id);

        brand.Name = request.Name;
        brand.CountryOfOrigin = request.CountryOfOrigin;

        _brandRepo.Update(brand);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}