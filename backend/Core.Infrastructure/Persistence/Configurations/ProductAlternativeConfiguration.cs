using Core.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class ProductAlternativeConfiguration : IEntityTypeConfiguration<ProductAlternative>
{
    public void Configure(EntityTypeBuilder<ProductAlternative> builder)
    {
        
        builder.HasIndex(pa => new { pa.ProductId, pa.AlternativeProductId }).IsUnique();

        builder.HasOne(pa => pa.Product)
            .WithMany()
            .HasForeignKey(pa => pa.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pa => pa.AlternativeProduct)
            .WithMany()
            .HasForeignKey(pa => pa.AlternativeProductId)
            .OnDelete(DeleteBehavior.Restrict); 
    }
}