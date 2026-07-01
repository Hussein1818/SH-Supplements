using Core.Application.Exceptions;
using Core.Domain.Constants;
using Core.Domain.Entities.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Auth.Commands;

public class AssignTrainerRoleCommand : IRequest<bool>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class AssignTrainerRoleCommandHandler : IRequestHandler<AssignTrainerRoleCommand, bool>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AssignTrainerRoleCommandHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<bool> Handle(AssignTrainerRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);

        if (user == null)
            throw new NotFoundException(nameof(ApplicationUser), request.UserId);

        var isInRole = await _userManager.IsInRoleAsync(user, Roles.Trainer);
        if (isInRole)
            throw new ConflictException("User is already assigned to the Trainer role.");

        var result = await _userManager.AddToRoleAsync(user, Roles.Trainer);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BadRequestException($"Failed to assign Trainer role: {errors}");
        }

        return true;
    }
}