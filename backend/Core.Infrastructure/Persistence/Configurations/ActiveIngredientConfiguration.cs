using Core.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class ActiveIngredientConfiguration : IEntityTypeConfiguration<ActiveIngredient>
{
    public void Configure(EntityTypeBuilder<ActiveIngredient> builder)
    {
        builder.Property(a => a.Name).IsRequired().HasMaxLength(100);
        builder.Property(a => a.UnitOfMeasurement).IsRequired().HasMaxLength(20);

        builder.HasIndex(a => a.Name).IsUnique();
    }
}