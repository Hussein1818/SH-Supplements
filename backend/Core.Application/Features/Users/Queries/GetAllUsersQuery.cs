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

    public async Task<List<AdminUserListDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var usersQuery = _userManager.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            usersQuery = usersQuery.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(search)) ||
                (u.UserName != null && u.UserName.ToLower().Contains(search)));
        }

        int pageNumber = request.PageNumber > 0 ? request.PageNumber : 1;
        int pageSize = request.PageSize > 0 ? request.PageSize : 10;

        var pagedUsers = usersQuery
            .OrderByDescending(u => u.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var userIds = pagedUsers.Select(u => u.Id).ToList();

        var profiles = await _profileRepo.FindAsync(p => userIds.Contains(p.UserId));
        var profileDict = profiles.ToDictionary(p => p.UserId, p => p);

        var result = pagedUsers.Select(u =>
        {
            profileDict.TryGetValue(u.Id, out var profile);

            return new AdminUserListDto
            {
                UserId = u.Id,
                Email = u.Email ?? string.Empty,
                FirstName = profile != null ? profile.FirstName : "N/A",
                LastName = profile != null ? profile.LastName : "N/A",
                PhoneNumber = profile != null && !string.IsNullOrEmpty(profile.PhoneNumber)
                                ? profile.PhoneNumber
                                : (u.PhoneNumber ?? "N/A"),
                WalletBalance = profile != null ? profile.WalletBalance : 0,
                LoyaltyPoints = profile != null ? profile.LoyaltyPoints : 0,
                ProfileImageUrl = profile?.ProfileImageUrl
            };
        }).ToList();

        return result;
    }
}