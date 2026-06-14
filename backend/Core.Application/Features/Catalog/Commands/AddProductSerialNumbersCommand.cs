using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class AddProductSerialNumbersCommand : IRequest<int>
{
    public Guid ProductId { get; set; }
    public List<string> SerialNumbers { get; set; } = new List<string>();
}

public class AddProductSerialNumbersCommandHandler : IRequestHandler<AddProductSerialNumbersCommand, int>
{
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IGenericRepository<ProductSerialNumber> _serialNumberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddProductSerialNumbersCommandHandler(
        IGenericRepository<Product> productRepository,
        IGenericRepository<ProductSerialNumber> serialNumberRepository,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _serialNumberRepository = serialNumberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(AddProductSerialNumbersCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId);
        if (product == null)
            throw new NotFoundException(nameof(Product), request.ProductId);

        if (request.SerialNumbers == null || !request.SerialNumbers.Any())
            throw new BadRequestException("You must provide at least one serial number or barcode.");

        int addedCount = 0;

        foreach (var serial in request.SerialNumbers)
        {
            var exists = await _serialNumberRepository.FirstOrDefaultAsync(s => s.SerialNumber == serial);

            if (exists == null)
            {
                var newSerial = new ProductSerialNumber
                {
                    ProductId = request.ProductId,
                    SerialNumber = serial,
                    VerificationCount = 0,
                    FirstVerifiedAt = null
                };

                await _serialNumberRepository.AddAsync(newSerial);
                addedCount++;
            }
        }


        if (addedCount > 0)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return addedCount; 
    }
}