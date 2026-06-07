using Core.Application.DTOs.Users;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Users;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Users.Queries;

public class GetUserAddressesQuery : IRequest<List<AddressDto>>
{
    public string UserId { get; set; } = string.Empty;
}

public class GetUserAddressesQueryHandler : IRequestHandler<GetUserAddressesQuery, List<AddressDto>>
{
    private readonly IGenericRepository<Address> _addressRepo;

    public GetUserAddressesQueryHandler(IGenericRepository<Address> addressRepo)
    {
        _addressRepo = addressRepo;
    }

    public async Task<List<AddressDto>> Handle(GetUserAddressesQuery request, CancellationToken cancellationToken)
    {
        var addresses = await _addressRepo.GetAllAsync();

        var userAddresses = addresses
            .Where(a => a.UserId == request.UserId)
            .Select(a => new AddressDto
            {
                Id = a.Id,
                Street = a.Street,
                City = a.City,
                State = a.State,
                ZipCode = a.ZipCode,
                Country = a.Country,
                IsDefault = a.IsDefault
            })
            .ToList();

        return userAddresses;
    }
}