using Core.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class ProductDosageGuideConfiguration : IEntityTypeConfiguration<ProductDosageGuide>
{
    public void Configure(EntityTypeBuilder<ProductDosageGuide> builder)
    {
        builder.Property(d => d.Instruction).IsRequired().HasMaxLength(200);
        builder.Property(d => d.PhaseName).IsRequired().HasMaxLength(50);

        builder.HasIndex(d => new { d.ProductId, d.RecommendedTime }).IsUnique();

        builder.HasOne(d => d.Product).WithMany().HasForeignKey(d => d.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}