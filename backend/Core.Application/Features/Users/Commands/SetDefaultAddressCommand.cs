using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Users;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Users.Commands;

public class SetDefaultAddressCommand : IRequest<bool>
{
    public string UserId { get; set; } = string.Empty;
    public Guid AddressId { get; set; }
}

public class SetDefaultAddressCommandHandler : IRequestHandler<SetDefaultAddressCommand, bool>
{
    private readonly IGenericRepository<Address> _addressRepo;
    private readonly IUnitOfWork _unitOfWork;

    public SetDefaultAddressCommandHandler(IGenericRepository<Address> addressRepo, IUnitOfWork unitOfWork)
    {
        _addressRepo = addressRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(SetDefaultAddressCommand request, CancellationToken cancellationToken)
    {
        var addresses = await _addressRepo.GetAllAsync();
        var userAddresses = addresses.Where(a => a.UserId == request.UserId).ToList();

        var targetAddress = userAddresses.FirstOrDefault(a => a.Id == request.AddressId);
        if (targetAddress == null)
            throw new NotFoundException(nameof(Address), request.AddressId);

        foreach (var addr in userAddresses)
        {
            addr.IsDefault = addr.Id == request.AddressId;
            _addressRepo.Update(addr);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}