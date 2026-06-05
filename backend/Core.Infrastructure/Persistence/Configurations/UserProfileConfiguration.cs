using Core.Domain.Entities;
using Core.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        // Table Name
        builder.ToTable("UserProfiles");

        // Required Fields & Max Lengths (Security against SQL Bloating)
        builder.Property(u => u.UserId).IsRequired().HasMaxLength(450); // Matches IdentityUser Id length
        builder.HasIndex(u => u.UserId).IsUnique(); // Ensure one profile per Identity account

        builder.Property(u => u.FirstName).IsRequired().HasMaxLength(50);
        builder.Property(u => u.LastName).IsRequired().HasMaxLength(50);
        builder.Property(u => u.PhoneNumber).HasMaxLength(20);

        // Precision for decimals (Very important to avoid rounding errors)
        builder.Property(u => u.Weight).HasColumnType("decimal(5,2)"); // e.g., 120.50
        builder.Property(u => u.Height).HasColumnType("decimal(5,2)"); // e.g., 180.00
        builder.Property(u => u.WalletBalance).HasColumnType("decimal(18,2)");
    }
}