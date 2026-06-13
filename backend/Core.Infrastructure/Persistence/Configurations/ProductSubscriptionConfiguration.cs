using Core.Domain.Entities.System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class ProductSubscriptionConfiguration : IEntityTypeConfiguration<ProductSubscription>
{
    public void Configure(EntityTypeBuilder<ProductSubscription> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.ShippingAddress).IsRequired().HasMaxLength(500);

        builder.HasOne(s => s.UserProfile)
               .WithMany()
               .HasForeignKey(s => s.UserId)
               .HasPrincipalKey(u => u.UserId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(s => s.Items)
               .WithOne(i => i.Subscription)
               .HasForeignKey(i => i.SubscriptionId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}