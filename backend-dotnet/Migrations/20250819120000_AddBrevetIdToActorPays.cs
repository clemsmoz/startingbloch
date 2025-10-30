using Microsoft.EntityFrameworkCore.Migrations;

namespace StartingBloch.Backend.Migrations
{
    public partial class AddBrevetIdToActorPays : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddColumn<int>(
                name: "id_brevet",
                table: "TitulairePays",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventeurPays_id_brevet",
                table: "InventeurPays",
                column: "id_brevet");

            migrationBuilder.CreateIndex(
                name: "IX_DeposantPays_id_brevet",
                table: "DeposantPays",
                column: "id_brevet");

            migrationBuilder.CreateIndex(
                name: "IX_TitulairePays_id_brevet",
                table: "TitulairePays",
                column: "id_brevet");

            migrationBuilder.AddForeignKey(
                name: "FK_InventeurPays_Brevets_id_brevet",
                table: "InventeurPays",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_DeposantPays_Brevets_id_brevet",
                table: "DeposantPays",
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventeurPays_Brevets_id_brevet",
                table: "InventeurPays");

            migrationBuilder.DropForeignKey(
                name: "FK_DeposantPays_Brevets_id_brevet",
                table: "DeposantPays");

            migrationBuilder.DropForeignKey(
                name: "FK_TitulairePays_Brevets_id_brevet",
                table: "TitulairePays");

            migrationBuilder.DropIndex(
                name: "IX_InventeurPays_id_brevet",
                table: "InventeurPays");

            migrationBuilder.DropIndex(
                name: "IX_DeposantPays_id_brevet",
                table: "DeposantPays");

            migrationBuilder.DropIndex(
                name: "IX_TitulairePays_id_brevet",
                table: "TitulairePays");

            migrationBuilder.DropColumn(
                name: "id_brevet",
                table: "InventeurPays");

            migrationBuilder.DropColumn(
                name: "id_brevet",
                table: "DeposantPays");

            migrationBuilder.DropColumn(
                name: "id_brevet",
                table: "TitulairePays");
        }
    }
}
