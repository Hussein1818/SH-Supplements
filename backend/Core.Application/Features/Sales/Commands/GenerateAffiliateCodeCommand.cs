using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Application.Settings;
using Core.Domain.Entities.Sales;
using MediatR;
using Microsoft.Extensions.Options;
using System;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Sales.Commands;

public class GenerateAffiliateCodeCommand : IRequest<Guid>
{
    [JsonIgnore] 
    public string CoachUserId { get; set; } = string.Empty;
    public string RequestedCode { get; set; } = string.Empty;
}

public class GenerateAffiliateCodeCommandHandler : IRequestHandler<GenerateAffiliateCodeCommand, Guid>
{
    private readonly IGenericRepository<AffiliateCode> _affiliateRepository;
    private readonly AffiliateSettings _settings;
    private readonly IUnitOfWork _unitOfWork;

    public GenerateAffiliateCodeCommandHandler(
        IGenericRepository<AffiliateCode> affiliateRepository,
        IOptions<AffiliateSettings> settings,
        IUnitOfWork unitOfWork)
    {
        _affiliateRepository = affiliateRepository;
        _settings = settings.Value;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(GenerateAffiliateCodeCommand request, CancellationToken cancellationToken)
    {
        // 1. Check if coach already has a code
        var existingCodeForCoach = await _affiliateRepository.FirstOrDefaultAsync(a => a.CoachUserId == request.CoachUserId);
        if (existingCodeForCoach != null)
            throw new ConflictException("You already have an active affiliate code.");

        // 2. Check if the requested code is already taken by someone else
        string formattedCode = request.RequestedCode.Trim().ToUpper();
        var codeExists = await _affiliateRepository.FirstOrDefaultAsync(a => a.Code.ToUpper() == formattedCode);
        if (codeExists != null)
            throw new ConflictException($"The code '{formattedCode}' is already taken. Please choose another one.");

        // 3. Create the affiliate code using dynamic settings
        var affiliateCode = new AffiliateCode
        {
            Code = formattedCode,
            CoachUserId = request.CoachUserId,
            DiscountPercentage = _settings.DefaultDiscountPercentage,
            CommissionPercentage = _settings.DefaultCommissionPercentage,
            IsActive = true,
            UsageCount = 0
        };

        await _affiliateRepository.AddAsync(affiliateCode);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return affiliateCode.Id;
    }
}