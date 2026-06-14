using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLoyaltyAndHealthMetrics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LoyaltyPoints",
                table: "UserProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "BodyFatPercentage",
                table: "HealthMetricRecords",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "MuscleMassPercentage",
                table: "HealthMetricRecords",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LoyaltyPoints",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "BodyFatPercentage",
                table: "HealthMetricRecords");

            migrationBuilder.DropColumn(
                name: "MuscleMassPercentage",
                table: "HealthMetricRecords");
        }
    }
}
