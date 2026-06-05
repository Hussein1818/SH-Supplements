using Core.Domain.Entities;
using Core.Domain.Entities.System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.Property(rt => rt.Token).IsRequired().HasMaxLength(256);
        builder.Property(rt => rt.JwtId).IsRequired().HasMaxLength(100);
        builder.Property(rt => rt.UserId).IsRequired().HasMaxLength(450);

        // Index for faster token lookups during authentication
        builder.HasIndex(rt => rt.Token).IsUnique();
    }
}