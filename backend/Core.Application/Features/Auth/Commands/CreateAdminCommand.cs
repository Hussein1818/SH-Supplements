using Core.Application.Exceptions;
using Core.Domain.Constants;
using Core.Domain.Entities.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Auth.Commands;

public class CreateAdminCommand : IRequest<string>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class CreateAdminCommandHandler : IRequestHandler<CreateAdminCommand, string>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public CreateAdminCommandHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<string> Handle(CreateAdminCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            throw new ConflictException("User with this email already exists.");

        var admin = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true 
        };

        var result = await _userManager.CreateAsync(admin, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BadRequestException($"Admin creation failed: {errors}");
        }

        await _userManager.AddToRoleAsync(admin, Roles.Admin);

        return admin.Id;
    }
}