using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Constants;
using Core.Domain.Entities.Sales;
using Core.Domain.Entities.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Auth.Commands;

public class RevokeTrainerRoleCommand : IRequest<bool>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class RevokeTrainerRoleCommandHandler : IRequestHandler<RevokeTrainerRoleCommand, bool>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IGenericRepository<AffiliateCode> _affiliateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RevokeTrainerRoleCommandHandler(
        UserManager<ApplicationUser> userManager,
        IGenericRepository<AffiliateCode> affiliateRepository,
        IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _affiliateRepository = affiliateRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(RevokeTrainerRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);

        if (user == null)
            throw new NotFoundException(nameof(ApplicationUser), request.UserId);

        var isInRole = await _userManager.IsInRoleAsync(user, Roles.Trainer);
        if (!isInRole)
            throw new ConflictException("User is not assigned to the Trainer role.");

        var result = await _userManager.RemoveFromRoleAsync(user, Roles.Trainer);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BadRequestException($"Failed to revoke Trainer role: {errors}");
        }

        var affiliateCode = await _affiliateRepository.FirstOrDefaultAsync(a => a.CoachUserId == request.UserId);
        if (affiliateCode != null && affiliateCode.IsActive)
        {
            affiliateCode.IsActive = false;
            _affiliateRepository.Update(affiliateCode);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return true;
    }
}