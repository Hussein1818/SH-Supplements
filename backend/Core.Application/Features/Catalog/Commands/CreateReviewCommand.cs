using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Features.Catalog.Commands;

public class CreateReviewCommand : IRequest<Guid>
{
    public Guid ProductId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }

    
    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Guid>
{
    private readonly IGenericRepository<Review> _reviewRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateReviewCommandHandler(
        IGenericRepository<Review> reviewRepository,
        IGenericRepository<Product> productRepository,
        IUnitOfWork unitOfWork)
    {
        _reviewRepository = reviewRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify product exists
        var product = await _productRepository.GetByIdAsync(request.ProductId);
        if (product == null)
            throw new NotFoundException(nameof(Product), request.ProductId);

        // 2. Prevent Duplicate Reviews (Spam Prevention)
        var existingReviews = await _reviewRepository.GetAllAsync();
        var hasReviewed = existingReviews.Any(r => r.ProductId == request.ProductId && r.UserId == request.UserId);

        if (hasReviewed)
            throw new ConflictException("You have already reviewed this product.");

        // 3. Create Review
        var review = new Review
        {
            ProductId = request.ProductId,
            UserId = request.UserId,
            Rating = request.Rating,
            Comment = request.Comment
        };

        await _reviewRepository.AddAsync(review);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return review.Id;
    }
}