using Core.Domain.Entities.Health;
using Core.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class HealthMetricRecordConfiguration : IEntityTypeConfiguration<HealthMetricRecord>
{
    public void Configure(EntityTypeBuilder<HealthMetricRecord> builder)
    {
        builder.ToTable("HealthMetricRecords");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId).IsRequired();
        builder.Property(x => x.Weight).IsRequired();
        builder.Property(x => x.Height).IsRequired();
        builder.Property(x => x.Age).IsRequired();

        builder.Property(x => x.Gender).IsRequired().HasConversion<int>();
        builder.Property(x => x.ActivityLevel).IsRequired().HasConversion<int>();
        builder.Property(x => x.BmiCategory).IsRequired().HasConversion<int>();

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}