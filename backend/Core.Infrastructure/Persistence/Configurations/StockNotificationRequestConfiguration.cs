using Core.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class StockNotificationRequestConfiguration : IEntityTypeConfiguration<StockNotificationRequest>
{
    public void Configure(EntityTypeBuilder<StockNotificationRequest> builder)
    {
        builder.HasOne(sn => sn.UserProfile)
               .WithMany()
               .HasForeignKey(sn => sn.UserId)
               .HasPrincipalKey(u => u.UserId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sn => sn.Product)
               .WithMany()
               .HasForeignKey(sn => sn.ProductId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}