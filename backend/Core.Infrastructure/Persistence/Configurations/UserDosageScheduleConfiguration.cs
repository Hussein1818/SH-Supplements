using Core.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class UserDosageScheduleConfiguration : IEntityTypeConfiguration<UserDosageSchedule>
{
    public void Configure(EntityTypeBuilder<UserDosageSchedule> builder)
    {
        builder.HasIndex(u => new { u.UserId, u.ProductId }).IsUnique();

        builder.HasOne(u => u.UserProfile)
            .WithMany()
            .HasForeignKey(u => u.UserId)
            .HasPrincipalKey(up => up.UserId) 
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(u => u.Product)
            .WithMany()
            .HasForeignKey(u => u.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}