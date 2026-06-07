using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Users;
using Core.Domain.Enums;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Users.Commands;

public class UpdateUserProfileCommand : IRequest<bool>
{
    public string UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int Age { get; set; }
    public decimal Weight { get; set; }
    public decimal Height { get; set; }
    public UserGoal Goal { get; set; }
    public string? MedicalConditions { get; set; }
}

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, bool>
{
    private readonly IGenericRepository<UserProfile> _profileRepo;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserProfileCommandHandler(IGenericRepository<UserProfile> profileRepo, IUnitOfWork unitOfWork)
    {
        _profileRepo = profileRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        var profiles = await _profileRepo.GetAllAsync();
        var profile = profiles.FirstOrDefault(p => p.UserId == request.UserId);

        if (profile == null)
            throw new NotFoundException(nameof(UserProfile), request.UserId);

        profile.FirstName = request.FirstName;
        profile.LastName = request.LastName;
        profile.PhoneNumber = request.PhoneNumber;
        profile.Age = request.Age;
        profile.Weight = request.Weight;
        profile.Height = request.Height;
        profile.Goal = request.Goal;
        profile.MedicalConditions = request.MedicalConditions;

        _profileRepo.Update(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        

        return true;
    }
}