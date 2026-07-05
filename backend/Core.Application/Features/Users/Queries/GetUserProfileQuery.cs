using Core.Application.DTOs.Users;
using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Users;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace Core.Application.Features.Users.Queries;

public class GetUserProfileQuery : IRequest<UserProfileDto>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly IGenericRepository<UserProfile> _profileRepo;
    private readonly IGenericRepository<Address> _addressRepo;

    public GetUserProfileQueryHandler(IGenericRepository<UserProfile> profileRepo, IGenericRepository<Address> addressRepo)
    {
        _profileRepo = profileRepo;
        _addressRepo = addressRepo;
    }

    public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        
        var profile = await _profileRepo.FirstOrDefaultAsync(p => p.UserId == request.UserId);

        if (profile == null)
            throw new NotFoundException(nameof(UserProfile), request.UserId);

        var userAddresses = await _addressRepo.FindAsync(a => a.UserId == request.UserId);

        return new UserProfileDto
        {
            Id = profile.UserId,
            FirstName = profile.FirstName,
            LastName = profile.LastName,
            PhoneNumber = profile.PhoneNumber,
            Age = profile.Age,
            Weight = profile.Weight,
            ProfileImageUrl = profile.ProfileImageUrl,
            Height = profile.Height,
            Goal = profile.Goal,
            MedicalConditions = profile.MedicalConditions,
            WalletBalance = profile.WalletBalance,
            Addresses = userAddresses.Select(a => new AddressDto
            {
                Id = a.Id,
                Street = a.Street,
                City = a.City,
                State = a.State,
                ZipCode = a.ZipCode,
                Country = a.Country,
                IsDefault = a.IsDefault
            }).ToList()
        };
    }
}