using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StartingBloch.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AdjustActorPaysFkDeleteBehavior : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 14, 52, 59, 308, DateTimeKind.Utc).AddTicks(7061), new DateTime(2025, 8, 19, 14, 52, 59, 308, DateTimeKind.Utc).AddTicks(7063) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 14, 52, 59, 308, DateTimeKind.Utc).AddTicks(7067), new DateTime(2025, 8, 19, 14, 52, 59, 308, DateTimeKind.Utc).AddTicks(7067) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 14, 52, 59, 308, DateTimeKind.Utc).AddTicks(7068), new DateTime(2025, 8, 19, 14, 52, 59, 308, DateTimeKind.Utc).AddTicks(7069) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 14, 52, 9, 731, DateTimeKind.Utc).AddTicks(5999), new DateTime(2025, 8, 19, 14, 52, 9, 731, DateTimeKind.Utc).AddTicks(6002) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 14, 52, 9, 731, DateTimeKind.Utc).AddTicks(6005), new DateTime(2025, 8, 19, 14, 52, 9, 731, DateTimeKind.Utc).AddTicks(6005) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 14, 52, 9, 731, DateTimeKind.Utc).AddTicks(6006), new DateTime(2025, 8, 19, 14, 52, 9, 731, DateTimeKind.Utc).AddTicks(6007) });
        }
    }
}
