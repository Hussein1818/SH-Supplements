using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Users;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Users.Queries;

public class GetUserLoyaltyPointsQuery : IRequest<int>
{
    public string UserId { get; set; } = string.Empty;
}

public class GetUserLoyaltyPointsQueryHandler : IRequestHandler<GetUserLoyaltyPointsQuery, int>
{
    private readonly IGenericRepository<UserProfile> _userProfileRepository;

    public GetUserLoyaltyPointsQueryHandler(IGenericRepository<UserProfile> userProfileRepository)
    {
        _userProfileRepository = userProfileRepository;
    }

    public async Task<int> Handle(GetUserLoyaltyPointsQuery request, CancellationToken cancellationToken)
    {
        var userProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == request.UserId);
        if (userProfile == null)
            throw new NotFoundException(nameof(UserProfile), request.UserId);

        return userProfile.LoyaltyPoints;
    }
}