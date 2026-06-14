using Core.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class IngredientGlossaryConfiguration : IEntityTypeConfiguration<IngredientGlossary>
{
    public void Configure(EntityTypeBuilder<IngredientGlossary> builder)
    {
        builder.Property(ig => ig.IngredientName).IsRequired().HasMaxLength(150);

        builder.HasIndex(ig => ig.IngredientName).IsUnique();
    }
}