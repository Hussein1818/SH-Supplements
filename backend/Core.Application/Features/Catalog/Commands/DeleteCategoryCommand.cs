using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class DeleteCategoryCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, bool>
{
    private readonly IGenericRepository<Category> _categoryRepo;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCategoryCommandHandler(IGenericRepository<Category> categoryRepo, IUnitOfWork unitOfWork)
    {
        _categoryRepo = categoryRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepo.GetByIdAsync(request.Id);
        if (category == null) throw new NotFoundException(nameof(Category), request.Id);

        _categoryRepo.Delete(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}