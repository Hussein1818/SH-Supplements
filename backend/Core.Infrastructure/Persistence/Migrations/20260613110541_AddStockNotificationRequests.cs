using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStockNotificationRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StockNotificationRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsNotified = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockNotificationRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockNotificationRequests_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockNotificationRequests_UserProfiles_UserId",
                        column: x => x.UserId,
                        principalTable: "UserProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StockNotificationRequests_ProductId",
                table: "StockNotificationRequests",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_StockNotificationRequests_UserId",
                table: "StockNotificationRequests",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StockNotificationRequests");
        }
    }
}
