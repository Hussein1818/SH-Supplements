using Core.Domain.Entities;
using Core.Domain.Entities.Financials;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class WalletTransactionConfiguration : IEntityTypeConfiguration<WalletTransaction>
{
    public void Configure(EntityTypeBuilder<WalletTransaction> builder)
    {
        builder.Property(wt => wt.Amount).HasColumnType("decimal(18,2)");
        builder.Property(wt => wt.Description).IsRequired().HasMaxLength(500);

        // Prevent cascade delete to keep financial history intact
        builder.HasOne(wt => wt.UserProfile)
               .WithMany()
               .HasForeignKey(wt => wt.UserId)
               .HasPrincipalKey(u => u.UserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}