using Core.Application.DTOs.Catalog;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Queries;

public class VerifySerialNumberCommand : IRequest<VerificationResultDto>
{
    public string SerialNumber { get; set; } = string.Empty;
}

public class VerifySerialNumberCommandHandler : IRequestHandler<VerifySerialNumberCommand, VerificationResultDto>
{
    private readonly IGenericRepository<ProductSerialNumber> _serialNumberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public VerifySerialNumberCommandHandler(
        IGenericRepository<ProductSerialNumber> serialNumberRepository,
        IUnitOfWork unitOfWork)
    {
        _serialNumberRepository = serialNumberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<VerificationResultDto> Handle(VerifySerialNumberCommand request, CancellationToken cancellationToken)
    {
        var serialRecord = await _serialNumberRepository.FirstOrDefaultAsync(s => s.SerialNumber == request.SerialNumber);

        if (serialRecord == null)
        {
            return new VerificationResultDto
            {
                IsAuthentic = false,
                Message = "Warning: This serial number does not exist in our database. The product might be counterfeit."
            };
        }

        serialRecord.VerificationCount++;
        if (serialRecord.FirstVerifiedAt == null)
        {
            serialRecord.FirstVerifiedAt = DateTime.UtcNow;
        }

        _serialNumberRepository.Update(serialRecord);
        await _unitOfWork.SaveChangesAsync(cancellationToken); 

        string resultMessage = serialRecord.VerificationCount > 5
            ? "Authentic, but WARNING: This serial number has been checked many times. If you just bought this, it might be a cloned label."
            : "Authentic: This product is genuine and verified.";

        return new VerificationResultDto
        {
            IsAuthentic = true,
            Message = resultMessage,
            VerificationCount = serialRecord.VerificationCount,
            FirstVerifiedAt = serialRecord.FirstVerifiedAt
        };
    }
}