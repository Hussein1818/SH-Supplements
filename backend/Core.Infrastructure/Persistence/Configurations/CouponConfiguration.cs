using Core.Domain.Entities;
using Core.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.HasIndex(c => c.Code).IsUnique(); 
        builder.Property(c => c.Code).IsRequired().HasMaxLength(20);
        builder.Property(c => c.DiscountPercentage).HasColumnType("decimal(5,2)");
        builder.Property(c => c.MaxDiscountAmount).HasColumnType("decimal(18,2)");
    }
}