using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Application.Interfaces.Services;
using Core.Domain.Entities.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration; 
using System;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Auth.Commands;

public class RegisterUserCommand : IRequest<string>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    
}

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, string>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly IGenericRepository<UserProfile> _userProfileRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public RegisterUserCommandHandler(
        UserManager<ApplicationUser> userManager,
        IEmailService emailService,
        IGenericRepository<UserProfile> userProfileRepo,
        IUnitOfWork unitOfWork,
        IConfiguration configuration) 
    {
        _userManager = userManager;
        _emailService = emailService;
        _userProfileRepo = userProfileRepo;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    public async Task<string> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        if (await _userManager.FindByNameAsync(request.Username) != null)
            throw new ConflictException("Username is already taken.");

        if (await _userManager.FindByEmailAsync(request.Email) != null)
            throw new ConflictException("Email is already registered.");

        var user = new ApplicationUser
        {
            UserName = request.Username,
            Email = request.Email,
            EmailConfirmed = false
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BadRequestException($"Registration failed: {errors}");
        }

        // Assign default Customer role
        await _userManager.AddToRoleAsync(user, "Customer");

        // Create Business Profile and Link to Identity User
        var userProfile = new UserProfile
        {
            UserId = user.Id,
            FirstName = request.FirstName,
            LastName = request.LastName,
            WalletBalance = 0
        };

        await _userProfileRepo.AddAsync(userProfile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Generate and send confirmation email
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

        // Pure C# URL-safe Base64 encoding
        var plainTextBytes = Encoding.UTF8.GetBytes(token);
        var encodedToken = Convert.ToBase64String(plainTextBytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

        
        var baseUrl = _configuration["AppUrls:ConfirmEmailEndpoint"];
        var confirmationLink = $"{baseUrl}?userId={user.Id}&token={encodedToken}";

        var emailBody = $"<h3>Welcome to SH-Supplements!</h3><p>Please confirm your account by <a href='{confirmationLink}'>clicking here</a>.</p>";

        await _emailService.SendEmailAsync(user.Email, "Confirm Your Email - SH-Supplements", emailBody);

        return user.Id;
    }
}