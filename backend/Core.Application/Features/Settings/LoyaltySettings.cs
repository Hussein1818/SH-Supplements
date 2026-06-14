namespace Core.Application.Settings;

public class LoyaltySettings
{
    // 1 point for every 10 EGP spent
    public decimal PointsPerCurrencyUnit { get; set; }

    // Bonus points for uploading an image with a review
    public int PointsForImageReview { get; set; }
    public decimal RedemptionDiscountPerPoint { get; set; }
}