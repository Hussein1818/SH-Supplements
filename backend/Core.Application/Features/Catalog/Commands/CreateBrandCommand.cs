using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class CreateBrandCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string CountryOfOrigin { get; set; } = string.Empty;
}

public class CreateBrandCommandHandler : IRequestHandler<CreateBrandCommand, Guid>
{
    private readonly IGenericRepository<Brand> _brandRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateBrandCommandHandler(IGenericRepository<Brand> brandRepository, IUnitOfWork unitOfWork)
    {
        _brandRepository = brandRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = new Brand
        {
            Name = request.Name,
            CountryOfOrigin = request.CountryOfOrigin
        };

        await _brandRepository.AddAsync(brand);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return brand.Id;
    }
}