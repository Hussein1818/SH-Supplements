using Core.Domain.Entities;
using Core.Domain.Entities.Financials;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
{
    public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
    {
        builder.Property(pt => pt.Amount).HasColumnType("decimal(18,2)");
        builder.Property(pt => pt.GatewayName).IsRequired().HasMaxLength(50);
        builder.Property(pt => pt.TransactionReference).IsRequired().HasMaxLength(255);

        // Response can be large, but we limit it to avoid abuse
        builder.Property(pt => pt.GatewayResponse).HasMaxLength(2000);
    }
}