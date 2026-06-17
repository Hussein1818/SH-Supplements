using Core.Application.Exceptions;
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
            throw new global::System.Exception(global::System.String.Join(", ", global::System.Linq.Enumerable.Select(result.Errors, e => e.Description)));
        await _userManager.AddToRoleAsync(admin, "Admin");

        return admin.Id;
    }
}