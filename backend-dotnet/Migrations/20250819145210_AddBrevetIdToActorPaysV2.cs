using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StartingBloch.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBrevetIdToActorPaysV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "id_brevet",
                table: "TitulairePays",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "id_brevet",
                table: "InventeurPays",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "id_brevet",
                table: "DeposantPays",
                type: "INTEGER",
                nullable: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_TitulairePays_id_brevet",
                table: "TitulairePays",
                column: "id_brevet");

            migrationBuilder.CreateIndex(
                name: "IX_InventeurPays_id_brevet",
                table: "InventeurPays",
                column: "id_brevet");

            migrationBuilder.CreateIndex(
                name: "IX_DeposantPays_id_brevet",
                table: "DeposantPays",
                column: "id_brevet");

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

            migrationBuilder.DropIndex(
                name: "IX_TitulairePays_id_brevet",
                table: "TitulairePays");

            migrationBuilder.DropIndex(
                name: "IX_InventeurPays_id_brevet",
                table: "InventeurPays");

            migrationBuilder.DropIndex(
                name: "IX_DeposantPays_id_brevet",
                table: "DeposantPays");

            migrationBuilder.DropColumn(
                name: "id_brevet",
                table: "TitulairePays");

            migrationBuilder.DropColumn(
                name: "id_brevet",
                table: "InventeurPays");

            migrationBuilder.DropColumn(
                name: "id_brevet",
                table: "DeposantPays");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 8, 14, 0, 516, DateTimeKind.Utc).AddTicks(3268), new DateTime(2025, 8, 19, 8, 14, 0, 516, DateTimeKind.Utc).AddTicks(3270) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 8, 14, 0, 516, DateTimeKind.Utc).AddTicks(3273), new DateTime(2025, 8, 19, 8, 14, 0, 516, DateTimeKind.Utc).AddTicks(3273) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 19, 8, 14, 0, 516, DateTimeKind.Utc).AddTicks(3274), new DateTime(2025, 8, 19, 8, 14, 0, 516, DateTimeKind.Utc).AddTicks(3274) });
        }
    }
}
