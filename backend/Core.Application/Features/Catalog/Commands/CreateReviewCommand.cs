using Core.Application.Exceptions;
using Core.Application.Interfaces.Repositories;
using Core.Application.Settings;
using Core.Domain.Entities.Catalog;
using MediatR;
using System;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Core.Domain.Entities.Users;

namespace Core.Application.Features.Catalog.Commands;

public class CreateReviewCommand : IRequest<Guid>
{
    public Guid ProductId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? ImageUrl { get; set; }

    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
}

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Guid>
{
    private readonly IGenericRepository<Review> _reviewRepository;
    private readonly IGenericRepository<Product> _productRepository;
    private readonly IGenericRepository<UserProfile> _userProfileRepository;
    private readonly LoyaltySettings _loyaltySettings;
    private readonly IUnitOfWork _unitOfWork;

    public CreateReviewCommandHandler(
        IGenericRepository<Review> reviewRepository,
        IGenericRepository<Product> productRepository,
        IGenericRepository<UserProfile> userProfileRepository,
        IOptions<LoyaltySettings> loyaltySettings,
        IUnitOfWork unitOfWork)
    {
        _reviewRepository = reviewRepository;
        _productRepository = productRepository;
        _userProfileRepository = userProfileRepository;
        _loyaltySettings = loyaltySettings.Value;
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

        // Reward user if they attached an image 
        if (!string.IsNullOrEmpty(request.ImageUrl))
        {
            var userProfile = await _userProfileRepository.FirstOrDefaultAsync(u => u.UserId == request.UserId);
            if (userProfile != null)
            {
                userProfile.LoyaltyPoints += _loyaltySettings.PointsForImageReview;
                _userProfileRepository.Update(userProfile);
            }
        }
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