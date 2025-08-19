using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StartingBloch.Backend.Migrations
{
    /// <inheritdoc />
    public partial class SetNullOnActorPaysBrevetFk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeposantPays_Brevets_id_brevet",
                table: "DeposantPays");

            migrationBuilder.DropForeignKey(
                name: "FK_InventeurPays_Brevets_id_brevet",
                table: "InventeurPays");

            migrationBuilder.DropForeignKey(
                name: "FK_TitulairePays_Brevets_id_brevet",
                table: "TitulairePays");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 14, 54, 2, 634, DateTimeKind.Utc).AddTicks(1806), new DateTime(2025, 8, 19, 14, 54, 2, 634, DateTimeKind.Utc).AddTicks(1808) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 14, 54, 2, 634, DateTimeKind.Utc).AddTicks(1811), new DateTime(2025, 8, 19, 14, 54, 2, 634, DateTimeKind.Utc).AddTicks(1811) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 14, 54, 2, 634, DateTimeKind.Utc).AddTicks(1812), new DateTime(2025, 8, 19, 14, 54, 2, 634, DateTimeKind.Utc).AddTicks(1813) });

            migrationBuilder.AddForeignKey(
                name: "FK_DeposantPays_Brevets_id_brevet",
                table: "DeposantPays",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_InventeurPays_Brevets_id_brevet",
                table: "InventeurPays",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_TitulairePays_Brevets_id_brevet",
                table: "TitulairePays",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeposantPays_Brevets_id_brevet",
                table: "DeposantPays");

            migrationBuilder.DropForeignKey(
                name: "FK_InventeurPays_Brevets_id_brevet",
                table: "InventeurPays");

            migrationBuilder.DropForeignKey(
                name: "FK_TitulairePays_Brevets_id_brevet",
                table: "TitulairePays");

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

            migrationBuilder.AddForeignKey(
                name: "FK_DeposantPays_Brevets_id_brevet",
                table: "DeposantPays",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet");

            migrationBuilder.AddForeignKey(
                name: "FK_InventeurPays_Brevets_id_brevet",
                table: "InventeurPays",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet");

            migrationBuilder.AddForeignKey(
                name: "FK_TitulairePays_Brevets_id_brevet",
                table: "TitulairePays",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet");
        }
    }
}
