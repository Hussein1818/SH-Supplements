using Core.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class ProductSerialNumberConfiguration : IEntityTypeConfiguration<ProductSerialNumber>
{
    public void Configure(EntityTypeBuilder<ProductSerialNumber> builder)
    {
        builder.Property(psn => psn.SerialNumber).IsRequired().HasMaxLength(150);

        builder.HasIndex(psn => psn.SerialNumber).IsUnique();

        builder.HasOne(psn => psn.Product)
               .WithMany()
               .HasForeignKey(psn => psn.ProductId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}