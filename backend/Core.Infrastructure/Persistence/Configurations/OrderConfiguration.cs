using Core.Domain.Entities;
using Core.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        // Money Decimals
        builder.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.DiscountAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.FinalAmount).HasColumnType("decimal(18,2)");

        // Storing Enums as Strings in DB is sometimes better for readability, 
        // but ints are faster. We will stick to the default (ints) for performance, 
        // but we ensure lengths for text properties.
        builder.Property(o => o.ShippingAddress).IsRequired().HasMaxLength(500);
        builder.Property(o => o.TrackingNumber).HasMaxLength(100);

        // Protect User History: Deleting a user shouldn't delete their financial orders
        builder.HasOne(o => o.UserProfile)
               .WithMany(u => u.Orders)
               .HasForeignKey(o => o.UserId)
               .HasPrincipalKey(u => u.UserId) // Links to the string UserId, not the Guid Id
               .OnDelete(DeleteBehavior.Restrict);
    }
}