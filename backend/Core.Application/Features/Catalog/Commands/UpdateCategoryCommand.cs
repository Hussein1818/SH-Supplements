using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class UpdateCategoryCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, bool>
{
    private readonly IGenericRepository<Category> _categoryRepo;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCategoryCommandHandler(IGenericRepository<Category> categoryRepo, IUnitOfWork unitOfWork)
    {
        _categoryRepo = categoryRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepo.GetByIdAsync(request.Id);
        if (category == null) throw new NotFoundException(nameof(Category), request.Id);

        category.Name = request.Name;
        category.Description = request.Description;

        _categoryRepo.Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}