using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StartingBloch.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInformationDepotCabinets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InformationDepotCabinets",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    information_depot_id = table.Column<int>(type: "INTEGER", nullable: false),
                    cabinet_id = table.Column<int>(type: "INTEGER", nullable: false),
                    category = table.Column<int>(type: "INTEGER", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InformationDepotCabinets", x => x.id);
                    table.ForeignKey(
                        name: "FK_InformationDepotCabinets_Cabinets_cabinet_id",
                        column: x => x.cabinet_id,
                        principalTable: "Cabinets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InformationDepotCabinets_InformationsDepot_information_depot_id",
                        column: x => x.information_depot_id,
                        principalTable: "InformationsDepot",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InformationDepotCabinetContacts",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    information_depot_cabinet_id = table.Column<int>(type: "INTEGER", nullable: false),
                    contact_id = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InformationDepotCabinetContacts", x => x.id);
                    table.ForeignKey(
                        name: "FK_InformationDepotCabinetContacts_Contacts_contact_id",
                        column: x => x.contact_id,
                        principalTable: "Contacts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InformationDepotCabinetContacts_InformationDepotCabinets_information_depot_cabinet_id",
                        column: x => x.information_depot_cabinet_id,
                        principalTable: "InformationDepotCabinets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InformationDepotCabinetRoles",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    information_depot_cabinet_id = table.Column<int>(type: "INTEGER", nullable: false),
                    role = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InformationDepotCabinetRoles", x => x.id);
                    table.ForeignKey(
                        name: "FK_InformationDepotCabinetRoles_InformationDepotCabinets_information_depot_cabinet_id",
                        column: x => x.information_depot_cabinet_id,
                        principalTable: "InformationDepotCabinets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_InfoDepotCabContact_Unique",
                table: "InformationDepotCabinetContacts",
                columns: new[] { "information_depot_cabinet_id", "contact_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InformationDepotCabinetContacts_contact_id",
                table: "InformationDepotCabinetContacts",
                column: "contact_id");

            migrationBuilder.CreateIndex(
                name: "IX_InfoDepotCabRole_Unique",
                table: "InformationDepotCabinetRoles",
                columns: new[] { "information_depot_cabinet_id", "role" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InfoDepotCab_Unique",
                table: "InformationDepotCabinets",
                columns: new[] { "information_depot_id", "cabinet_id", "category" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InformationDepotCabinets_cabinet_id",
                table: "InformationDepotCabinets",
                column: "cabinet_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InformationDepotCabinetContacts");

            migrationBuilder.DropTable(
                name: "InformationDepotCabinetRoles");

            migrationBuilder.DropTable(
                name: "InformationDepotCabinets");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 4, 16, 25, 58, 465, DateTimeKind.Utc).AddTicks(4015), new DateTime(2025, 8, 4, 16, 25, 58, 465, DateTimeKind.Utc).AddTicks(4017) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 4, 16, 25, 58, 465, DateTimeKind.Utc).AddTicks(4020), new DateTime(2025, 8, 4, 16, 25, 58, 465, DateTimeKind.Utc).AddTicks(4020) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 4, 16, 25, 58, 465, DateTimeKind.Utc).AddTicks(4021), new DateTime(2025, 8, 4, 16, 25, 58, 465, DateTimeKind.Utc).AddTicks(4021) });
        }
    }
}
