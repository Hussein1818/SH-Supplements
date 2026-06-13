using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProductSubscriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductSubscriptions_Products_ProductId",
                table: "ProductSubscriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductSubscriptions_UserProfiles_UserProfileId",
                table: "ProductSubscriptions");

            migrationBuilder.DropIndex(
                name: "IX_ProductSubscriptions_ProductId",
                table: "ProductSubscriptions");

            migrationBuilder.DropIndex(
                name: "IX_ProductSubscriptions_UserProfileId",
                table: "ProductSubscriptions");

            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "ProductSubscriptions");

            migrationBuilder.DropColumn(
                name: "UserProfileId",
                table: "ProductSubscriptions");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "ProductSubscriptions",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "ShippingAddress",
                table: "ProductSubscriptions",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "SubscriptionItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionItems_ProductSubscriptions_SubscriptionId",
                        column: x => x.SubscriptionId,
                        principalTable: "ProductSubscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubscriptionItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductSubscriptions_UserId",
                table: "ProductSubscriptions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionItems_ProductId",
                table: "SubscriptionItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionItems_SubscriptionId",
                table: "SubscriptionItems",
                column: "SubscriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductSubscriptions_UserProfiles_UserId",
                table: "ProductSubscriptions",
                column: "UserId",
                principalTable: "UserProfiles",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductSubscriptions_UserProfiles_UserId",
                table: "ProductSubscriptions");

            migrationBuilder.DropTable(
                name: "SubscriptionItems");

            migrationBuilder.DropIndex(
                name: "IX_ProductSubscriptions_UserId",
                table: "ProductSubscriptions");

            migrationBuilder.DropColumn(
                name: "ShippingAddress",
                table: "ProductSubscriptions");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "ProductSubscriptions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<Guid>(
                name: "ProductId",
                table: "ProductSubscriptions",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserProfileId",
                table: "ProductSubscriptions",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_ProductSubscriptions_ProductId",
                table: "ProductSubscriptions",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSubscriptions_UserProfileId",
                table: "ProductSubscriptions",
                column: "UserProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductSubscriptions_Products_ProductId",
                table: "ProductSubscriptions",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductSubscriptions_UserProfiles_UserProfileId",
                table: "ProductSubscriptions",
                column: "UserProfileId",
                principalTable: "UserProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
