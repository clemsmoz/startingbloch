using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StartingBloch.Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Brevets",
                columns: table => new
                {
                    id_brevet = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    reference_famille = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    titre = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    commentaire = table.Column<string>(type: "TEXT", nullable: true),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brevets", x => x.id_brevet);
                });

            migrationBuilder.CreateTable(
                name: "Cabinets",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    nom_cabinet = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    adresse_cabinet = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    code_postal = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    pays_cabinet = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    email_cabinet = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    telephone_cabinet = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cabinets", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    nom_client = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    reference_client = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    adresse_client = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    code_postal = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    pays_client = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    email_client = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    telephone_client = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    can_write = table.Column<bool>(type: "INTEGER", nullable: false),
                    can_read = table.Column<bool>(type: "INTEGER", nullable: false),
                    is_blocked = table.Column<bool>(type: "INTEGER", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Deposants",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    nom = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    prenom = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    adresse = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    telephone = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deposants", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Inventeurs",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    nom = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    prenom = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    adresse = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    telephone = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventeurs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Logs",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    level = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    message = table.Column<string>(type: "TEXT", nullable: false),
                    timestamp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    userId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    action = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    table_name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    record_id = table.Column<int>(type: "INTEGER", nullable: true),
                    old_values = table.Column<string>(type: "TEXT", nullable: true),
                    new_values = table.Column<string>(type: "TEXT", nullable: true),
                    ip_address = table.Column<string>(type: "TEXT", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    details = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Pays",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    nom_fr_fr = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    code_iso = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    code_iso3 = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pays", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Statuts",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    description = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Statuts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Titulaires",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    nom = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    prenom = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    adresse = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    telephone = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Titulaires", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "BrevetCabinets",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    id_brevet = table.Column<int>(type: "INTEGER", nullable: false),
                    id_cabinet = table.Column<int>(type: "INTEGER", nullable: false),
                    type = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BrevetCabinets", x => x.id);
                    table.ForeignKey(
                        name: "FK_BrevetCabinets_Brevets_id_brevet",
                        column: x => x.id_brevet,
                        principalTable: "Brevets",
                        principalColumn: "id_brevet",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BrevetCabinets_Cabinets_id_cabinet",
                        column: x => x.id_cabinet,
                        principalTable: "Cabinets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BrevetClients",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    id_brevet = table.Column<int>(type: "INTEGER", nullable: false),
                    id_client = table.Column<int>(type: "INTEGER", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BrevetClients", x => x.id);
                    table.ForeignKey(
                        name: "FK_BrevetClients_Brevets_id_brevet",
                        column: x => x.id_brevet,
                        principalTable: "Brevets",
                        principalColumn: "id_brevet",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BrevetClients_Clients_id_client",
                        column: x => x.id_client,
                        principalTable: "Clients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientCabinets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ClientId = table.Column<int>(type: "INTEGER", nullable: false),
                    CabinetId = table.Column<int>(type: "INTEGER", nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientCabinets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientCabinets_Cabinets_CabinetId",
                        column: x => x.CabinetId,
                        principalTable: "Cabinets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClientCabinets_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Contacts",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    nom = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    prenom = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    telephone = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    role = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    id_cabinet = table.Column<int>(type: "INTEGER", nullable: true),
                    id_client = table.Column<int>(type: "INTEGER", nullable: true),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    emails_json = table.Column<string>(type: "TEXT", nullable: false),
                    phones_json = table.Column<string>(type: "TEXT", nullable: false),
                    roles_json = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.id);
                    table.ForeignKey(
                        name: "FK_Contacts_Cabinets_id_cabinet",
                        column: x => x.id_cabinet,
                        principalTable: "Cabinets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Contacts_Clients_id_client",
                        column: x => x.id_client,
                        principalTable: "Clients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    username = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    password = table.Column<string>(type: "TEXT", nullable: false),
                    role = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "user"),
                    canWrite = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    canRead = table.Column<bool>(type: "INTEGER", nullable: false),
                    isActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    isBlocked = table.Column<bool>(type: "INTEGER", nullable: false),
                    nom = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    prenom = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    lastLogin = table.Column<DateTime>(type: "TEXT", nullable: true),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    clientId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.id);
                    table.ForeignKey(
                        name: "FK_Users_Clients_clientId",
                        column: x => x.clientId,
                        principalTable: "Clients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "BrevetDeposants",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    id_brevet = table.Column<int>(type: "INTEGER", nullable: false),
                    id_deposant = table.Column<int>(type: "INTEGER", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BrevetDeposants", x => x.id);
                    table.ForeignKey(
                        name: "FK_BrevetDeposants_Brevets_id_brevet",
                        column: x => x.id_brevet,
                        principalTable: "Brevets",
                        principalColumn: "id_brevet",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BrevetDeposants_Deposants_id_deposant",
                        column: x => x.id_deposant,
                        principalTable: "Deposants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BrevetInventeurs",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    id_brevet = table.Column<int>(type: "INTEGER", nullable: false),
                    id_inventeur = table.Column<int>(type: "INTEGER", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BrevetInventeurs", x => x.id);
                    table.ForeignKey(
                        name: "FK_BrevetInventeurs_Brevets_id_brevet",
                        column: x => x.id_brevet,
                        principalTable: "Brevets",
                        principalColumn: "id_brevet",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BrevetInventeurs_Inventeurs_id_inventeur",
                        column: x => x.id_inventeur,
                        principalTable: "Inventeurs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DeposantPays",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    id_deposant = table.Column<int>(type: "INTEGER", nullable: false),
                    id_pays = table.Column<int>(type: "INTEGER", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeposantPays", x => x.id);
                    table.ForeignKey(
                        name: "FK_DeposantPays_Deposants_id_deposant",
                        column: x => x.id_deposant,
                        principalTable: "Deposants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeposantPays_Pays_id_pays",
                        column: x => x.id_pays,
                        principalTable: "Pays",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventeurPays",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    id_inventeur = table.Column<int>(type: "INTEGER", nullable: false),
                    id_pays = table.Column<int>(type: "INTEGER", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventeurPays", x => x.id);
                    table.ForeignKey(
                        name: "FK_InventeurPays_Inventeurs_id_inventeur",
                        column: x => x.id_inventeur,
                        principalTable: "Inventeurs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InventeurPays_Pays_id_pays",
                        column: x => x.id_pays,
                        principalTable: "Pays",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NumeroPays",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    pays_code = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    numero = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    is_active = table.Column<bool>(type: "INTEGER", nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PaysId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NumeroPays", x => x.id);
                    table.ForeignKey(
                        name: "FK_NumeroPays_Pays_PaysId",
                        column: x => x.PaysId,
                        principalTable: "Pays",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "InformationsDepot",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    id_brevet = table.Column<int>(type: "INTEGER", nullable: false),
                    id_pays = table.Column<int>(type: "INTEGER", nullable: true),
                    id_statuts = table.Column<int>(type: "INTEGER", nullable: true),
                    numero_depot = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    numero_publication = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    numero_delivrance = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    date_depot = table.Column<DateTime>(type: "TEXT", nullable: true),
                    date_publication = table.Column<DateTime>(type: "TEXT", nullable: true),
                    date_delivrance = table.Column<DateTime>(type: "TEXT", nullable: true),
                    licence = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    commentaire = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InformationsDepot", x => x.id);
                    table.ForeignKey(
                        name: "FK_InformationsDepot_Brevets_id_brevet",
                        column: x => x.id_brevet,
                        principalTable: "Brevets",
                        principalColumn: "id_brevet",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InformationsDepot_Pays_id_pays",
                        column: x => x.id_pays,
                        principalTable: "Pays",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_InformationsDepot_Statuts_id_statuts",
                        column: x => x.id_statuts,
                        principalTable: "Statuts",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "BrevetTitulaires",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    id_brevet = table.Column<int>(type: "INTEGER", nullable: false),
                    id_titulaire = table.Column<int>(type: "INTEGER", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BrevetTitulaires", x => x.id);
                    table.ForeignKey(
                        name: "FK_BrevetTitulaires_Brevets_id_brevet",
                        column: x => x.id_brevet,
                        principalTable: "Brevets",
                        principalColumn: "id_brevet",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BrevetTitulaires_Titulaires_id_titulaire",
                        column: x => x.id_titulaire,
                        principalTable: "Titulaires",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TitulairePays",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    id_titulaire = table.Column<int>(type: "INTEGER", nullable: false),
                    id_pays = table.Column<int>(type: "INTEGER", nullable: false),
                    createdAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TitulairePays", x => x.id);
                    table.ForeignKey(
                        name: "FK_TitulairePays_Pays_id_pays",
                        column: x => x.id_pays,
                        principalTable: "Pays",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TitulairePays_Titulaires_id_titulaire",
                        column: x => x.id_titulaire,
                        principalTable: "Titulaires",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    RoleId = table.Column<int>(type: "INTEGER", nullable: false),
                    ClientId = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRoles_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreatedAt", "Description", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 8, 1, 9, 14, 52, 420, DateTimeKind.Utc).AddTicks(8480), "Employé StartingBloch - Administrateur avec accès complet et gestion des utilisateurs", "admin", new DateTime(2025, 8, 1, 9, 14, 52, 420, DateTimeKind.Utc).AddTicks(8482) },
                    { 2, new DateTime(2025, 8, 1, 9, 14, 52, 420, DateTimeKind.Utc).AddTicks(8485), "Employé StartingBloch - Utilisateur standard avec droits configurables", "user", new DateTime(2025, 8, 1, 9, 14, 52, 420, DateTimeKind.Utc).AddTicks(8485) },
                    { 3, new DateTime(2025, 8, 1, 9, 14, 52, 420, DateTimeKind.Utc).AddTicks(8486), "Client StartingBloch - Accès restreint à ses propres brevets uniquement", "client", new DateTime(2025, 8, 1, 9, 14, 52, 420, DateTimeKind.Utc).AddTicks(8486) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_BrevetCabinets_id_brevet",
                table: "BrevetCabinets",
                column: "id_brevet");

            migrationBuilder.CreateIndex(
                name: "IX_BrevetCabinets_id_cabinet",
                table: "BrevetCabinets",
                column: "id_cabinet");

            migrationBuilder.CreateIndex(
                name: "IX_BrevetClients_id_client",
                table: "BrevetClients",
                column: "id_client");

            migrationBuilder.CreateIndex(
                name: "IX_BrevetClients_Unique",
                table: "BrevetClients",
                columns: new[] { "id_brevet", "id_client" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BrevetDeposants_id_deposant",
                table: "BrevetDeposants",
                column: "id_deposant");

            migrationBuilder.CreateIndex(
                name: "IX_BrevetDeposants_Unique",
                table: "BrevetDeposants",
                columns: new[] { "id_brevet", "id_deposant" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BrevetInventeurs_id_inventeur",
                table: "BrevetInventeurs",
                column: "id_inventeur");

            migrationBuilder.CreateIndex(
                name: "IX_BrevetInventeurs_Unique",
                table: "BrevetInventeurs",
                columns: new[] { "id_brevet", "id_inventeur" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Brevets_ReferenceFamille",
                table: "Brevets",
                column: "reference_famille");

            migrationBuilder.CreateIndex(
                name: "IX_BrevetTitulaires_id_titulaire",
                table: "BrevetTitulaires",
                column: "id_titulaire");

            migrationBuilder.CreateIndex(
                name: "IX_BrevetTitulaires_Unique",
                table: "BrevetTitulaires",
                columns: new[] { "id_brevet", "id_titulaire" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClientCabinets_CabinetId",
                table: "ClientCabinets",
                column: "CabinetId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientCabinets_Unique",
                table: "ClientCabinets",
                columns: new[] { "ClientId", "CabinetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_NomClient",
                table: "Clients",
                column: "nom_client");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_id_cabinet",
                table: "Contacts",
                column: "id_cabinet");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_id_client",
                table: "Contacts",
                column: "id_client");

            migrationBuilder.CreateIndex(
                name: "IX_DeposantPays_id_deposant",
                table: "DeposantPays",
                column: "id_deposant");

            migrationBuilder.CreateIndex(
                name: "IX_DeposantPays_id_pays",
                table: "DeposantPays",
                column: "id_pays");

            migrationBuilder.CreateIndex(
                name: "IX_InformationsDepot_id_brevet",
                table: "InformationsDepot",
                column: "id_brevet");

            migrationBuilder.CreateIndex(
                name: "IX_InformationsDepot_id_pays",
                table: "InformationsDepot",
                column: "id_pays");

            migrationBuilder.CreateIndex(
                name: "IX_InformationsDepot_id_statuts",
                table: "InformationsDepot",
                column: "id_statuts");

            migrationBuilder.CreateIndex(
                name: "IX_InventeurPays_id_inventeur",
                table: "InventeurPays",
                column: "id_inventeur");

            migrationBuilder.CreateIndex(
                name: "IX_InventeurPays_id_pays",
                table: "InventeurPays",
                column: "id_pays");

            migrationBuilder.CreateIndex(
                name: "IX_NumeroPays_PaysId",
                table: "NumeroPays",
                column: "PaysId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TitulairePays_id_pays",
                table: "TitulairePays",
                column: "id_pays");

            migrationBuilder.CreateIndex(
                name: "IX_TitulairePays_id_titulaire",
                table: "TitulairePays",
                column: "id_titulaire");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_ClientId",
                table: "UserRoles",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_Unique",
                table: "UserRoles",
                columns: new[] { "UserId", "RoleId", "ClientId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ClientId",
                table: "Users",
                column: "clientId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BrevetCabinets");

            migrationBuilder.DropTable(
                name: "BrevetClients");

            migrationBuilder.DropTable(
                name: "BrevetDeposants");

            migrationBuilder.DropTable(
                name: "BrevetInventeurs");

            migrationBuilder.DropTable(
                name: "BrevetTitulaires");

            migrationBuilder.DropTable(
                name: "ClientCabinets");

            migrationBuilder.DropTable(
                name: "Contacts");

            migrationBuilder.DropTable(
                name: "DeposantPays");

            migrationBuilder.DropTable(
                name: "InformationsDepot");

            migrationBuilder.DropTable(
                name: "InventeurPays");

            migrationBuilder.DropTable(
                name: "Logs");

            migrationBuilder.DropTable(
                name: "NumeroPays");

            migrationBuilder.DropTable(
                name: "TitulairePays");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "Cabinets");

            migrationBuilder.DropTable(
                name: "Deposants");

            migrationBuilder.DropTable(
                name: "Brevets");

            migrationBuilder.DropTable(
                name: "Statuts");

            migrationBuilder.DropTable(
                name: "Inventeurs");

            migrationBuilder.DropTable(
                name: "Pays");

            migrationBuilder.DropTable(
                name: "Titulaires");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Clients");
        }
    }
}
