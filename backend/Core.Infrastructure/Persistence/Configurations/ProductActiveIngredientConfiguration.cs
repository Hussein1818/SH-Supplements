using Core.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class ProductActiveIngredientConfiguration : IEntityTypeConfiguration<ProductActiveIngredient>
{
    public void Configure(EntityTypeBuilder<ProductActiveIngredient> builder)
    {
      
        builder.HasIndex(pai => new { pai.ProductId, pai.ActiveIngredientId }).IsUnique();

        builder.HasOne(pai => pai.Product)
            .WithMany()
            .HasForeignKey(pai => pai.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pai => pai.ActiveIngredient)
            .WithMany(ai => ai.ProductIngredients)
            .HasForeignKey(pai => pai.ActiveIngredientId)
            .OnDelete(DeleteBehavior.Restrict); 
    }
}