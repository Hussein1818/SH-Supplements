using Core.Application.DTOs.Sales;
using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.Users;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Queries;

public class GetCoachDashboardQuery : IRequest<CoachDashboardDto>
{

    public string CoachUserId { get; set; } = string.Empty;
}

public class GetCoachDashboardQueryHandler : IRequestHandler<GetCoachDashboardQuery, CoachDashboardDto>
{
    private readonly IGenericRepository<AffiliateCode> _affiliateRepository;
    private readonly IGenericRepository<UserProfile> _userProfileRepository;

    public GetCoachDashboardQueryHandler(
        IGenericRepository<AffiliateCode> affiliateRepository,
        IGenericRepository<UserProfile> userProfileRepository)
    {
        _affiliateRepository = affiliateRepository;
        _userProfileRepository = userProfileRepository;
    }

    public async Task<CoachDashboardDto> Handle(GetCoachDashboardQuery request, CancellationToken cancellationToken)
    {

        var affiliateCode = await _affiliateRepository.FirstOrDefaultAsync(a => a.CoachUserId == request.CoachUserId);

        if (affiliateCode == null)
            throw new NotFoundException(nameof(AffiliateCode), request.CoachUserId);

        var coachProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == request.CoachUserId);

        if (coachProfile == null)
            throw new NotFoundException(nameof(UserProfile), request.CoachUserId);

        return new CoachDashboardDto
        {
            AffiliateCode = affiliateCode.Code,
            UsageCount = affiliateCode.UsageCount,
            CommissionPercentage = affiliateCode.CommissionPercentage,
            CurrentWalletBalance = coachProfile.WalletBalance
        };
    }
}