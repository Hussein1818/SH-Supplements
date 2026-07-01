using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Users;
using MediatR;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Users.Commands;

public class AddAddressCommand : IRequest<bool>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}

public class AddAddressCommandHandler : IRequestHandler<AddAddressCommand, bool>
{
    private readonly IGenericRepository<Address> _addressRepo;
    private readonly IGenericRepository<UserProfile> _profileRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AddAddressCommandHandler(IGenericRepository<Address> addressRepo, IGenericRepository<UserProfile> profileRepo, IUnitOfWork unitOfWork)
    {
        _addressRepo = addressRepo;
        _profileRepo = profileRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(AddAddressCommand request, CancellationToken cancellationToken)
    {
        var profiles = await _profileRepo.GetAllAsync();
        var profile = profiles.FirstOrDefault(p => p.UserId == request.UserId);

        if (profile == null)
            throw new NotFoundException(nameof(UserProfile), request.UserId);

        var addresses = await _addressRepo.GetAllAsync();
        var userAddresses = addresses.Where(a => a.UserId == request.UserId).ToList();

        // If the user wants this to be default, unset all existing defaults
        if (request.IsDefault && userAddresses.Any())
        {
            foreach (var addr in userAddresses.Where(a => a.IsDefault))
            {
                addr.IsDefault = false;
                _addressRepo.Update(addr);
            }
        }

        var isFirstAddress = !userAddresses.Any();

        var newAddress = new Address
        {
            UserProfileId = profile.Id,
            UserId = request.UserId,
            Street = request.Street,
            City = request.City,
            State = request.State,
            ZipCode = request.ZipCode,
            Country = request.Country,
            IsDefault = isFirstAddress || request.IsDefault
        };

        await _addressRepo.AddAsync(newAddress);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}