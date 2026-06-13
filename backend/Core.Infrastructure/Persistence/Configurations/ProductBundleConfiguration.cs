using Core.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class ProductBundleConfiguration : IEntityTypeConfiguration<ProductBundle>
{
    public void Configure(EntityTypeBuilder<ProductBundle> builder)
    {
        builder.Property(pb => pb.Name).IsRequired().HasMaxLength(200);
        builder.Property(pb => pb.DiscountPercentage).HasColumnType("decimal(5,2)");

        builder.HasMany(pb => pb.Items)
               .WithOne(bi => bi.Bundle)
               .HasForeignKey(bi => bi.BundleId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}