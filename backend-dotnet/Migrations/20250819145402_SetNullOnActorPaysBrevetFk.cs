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

            // Suppression des UpdateData sur Roles (seeding désormais au runtime)

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

            // Suppression des UpdateData sur Roles (seeding désormais au runtime)

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
