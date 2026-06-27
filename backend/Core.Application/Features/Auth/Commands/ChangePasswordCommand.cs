using Core.Application.Exceptions;
using Core.Domain.Entities.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace Core.Application.Features.Auth.Commands;

public class ChangePasswordCommand : IRequest<bool>
{
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, bool>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public ChangePasswordCommandHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
            throw new NotFoundException(nameof(ApplicationUser), request.UserId);

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BadRequestException($"Password change failed: {errors}");
        }

        return true;
    }
}