using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StartingBloch.Backend.Migrations
{
    /// <inheritdoc />
    public partial class RestoreBrevetTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Créer la table Brevets exactement comme dans InitialCreate
            migrationBuilder.CreateTable(
                name: "Brevets",
                columns: table => new
                {
                    id_brevet = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.SerialColumn),
                    reference_famille = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    titre = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    commentaire = table.Column<string>(type: "TEXT", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brevets", x => x.id_brevet);
                });

            // Créer l'index sur reference_famille comme dans InitialCreate
            migrationBuilder.CreateIndex(
                name: "IX_Brevets_ReferenceFamille",
                table: "Brevets",
                column: "reference_famille");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Supprimer la table Brevets
            migrationBuilder.DropTable(
                name: "Brevets");
        }
    }
}
