using Core.Application.DTOs.Users;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Users.Queries;

public class GetAllUsersQuery : IRequest<List<AdminUserListDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
}

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, List<AdminUserListDto>>
{
    private readonly IGenericRepository<UserProfile> _profileRepo;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetAllUsersQueryHandler(IGenericRepository<UserProfile> profileRepo, UserManager<ApplicationUser> userManager)
    {
        _profileRepo = profileRepo;
        _userManager = userManager;
    }

    public Task<List<AdminUserListDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _profileRepo.GetQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            query = query.Where(p => p.FirstName.ToLower().Contains(search) || p.LastName.ToLower().Contains(search));
        }

        var pagedProfiles = query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var userIds = pagedProfiles.Select(p => p.UserId).ToList();
        var identityUsers = _userManager.Users.Where(u => userIds.Contains(u.Id)).ToList();
        var identityDict = identityUsers.ToDictionary(u => u.Id, u => u.Email);

        var result = pagedProfiles.Select(p => new AdminUserListDto
        {
            UserId = p.UserId,
            FirstName = p.FirstName,
            LastName = p.LastName,
            PhoneNumber = p.PhoneNumber,
            WalletBalance = p.WalletBalance,
            LoyaltyPoints = p.LoyaltyPoints,
            ProfileImageUrl = p.ProfileImageUrl,
            Email = identityDict.ContainsKey(p.UserId) ? identityDict[p.UserId] ?? string.Empty : string.Empty
        }).ToList();

        return Task.FromResult(result);
    }
}