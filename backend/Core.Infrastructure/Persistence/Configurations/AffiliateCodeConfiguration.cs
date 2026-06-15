using Core.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class AffiliateCodeConfiguration : IEntityTypeConfiguration<AffiliateCode>
{
    public void Configure(EntityTypeBuilder<AffiliateCode> builder)
    {
        builder.Property(a => a.Code).IsRequired().HasMaxLength(50);
        builder.Property(a => a.CoachUserId).IsRequired();

        // Prevent duplicate affiliate codes globally
        builder.HasIndex(a => a.Code).IsUnique();

        // One active code per coach
        builder.HasIndex(a => a.CoachUserId).IsUnique();
    }
}