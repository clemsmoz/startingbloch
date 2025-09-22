using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace StartingBloch.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInformationDepotCabinetSets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BrevetCabinets_Brevets_id_brevet",
                table: "BrevetCabinets");

            migrationBuilder.DropForeignKey(
                name: "FK_BrevetCabinets_Cabinets_id_cabinet",
                table: "BrevetCabinets");

            migrationBuilder.DropForeignKey(
                name: "FK_BrevetClients_Brevets_id_brevet",
                table: "BrevetClients");

            migrationBuilder.DropForeignKey(
                name: "FK_BrevetClients_Clients_id_client",
                table: "BrevetClients");

            migrationBuilder.DropForeignKey(
                name: "FK_BrevetDeposants_Brevets_id_brevet",
                table: "BrevetDeposants");

            migrationBuilder.DropForeignKey(
                name: "FK_BrevetDeposants_Deposants_id_deposant",
                table: "BrevetDeposants");

            migrationBuilder.DropForeignKey(
                name: "FK_BrevetInventeurs_Brevets_id_brevet",
                table: "BrevetInventeurs");

            migrationBuilder.DropForeignKey(
                name: "FK_BrevetInventeurs_Inventeurs_id_inventeur",
                table: "BrevetInventeurs");

            migrationBuilder.DropForeignKey(
                name: "FK_BrevetTitulaires_Brevets_id_brevet",
                table: "BrevetTitulaires");

            migrationBuilder.DropForeignKey(
                name: "FK_BrevetTitulaires_Titulaires_id_titulaire",
                table: "BrevetTitulaires");

            migrationBuilder.DropForeignKey(
                name: "FK_ClientCabinets_Cabinets_CabinetId",
                table: "ClientCabinets");

            migrationBuilder.DropForeignKey(
                name: "FK_ClientCabinets_Clients_ClientId",
                table: "ClientCabinets");

            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_Cabinets_id_cabinet",
                table: "Contacts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_Clients_id_client",
                table: "Contacts");

            migrationBuilder.DropForeignKey(
                name: "FK_DeposantPays_Brevets_id_brevet",
                table: "DeposantPays");

            migrationBuilder.DropForeignKey(
                name: "FK_DeposantPays_Deposants_id_deposant",
                table: "DeposantPays");

            migrationBuilder.DropForeignKey(
                name: "FK_DeposantPays_Pays_id_pays",
                table: "DeposantPays");

            migrationBuilder.DropForeignKey(
                name: "FK_InformationDepotCabinetContacts_Contacts_contact_id",
                table: "InformationDepotCabinetContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_InformationDepotCabinetContacts_InformationDepotCabinets_information_depot_cabinet_id",
                table: "InformationDepotCabinetContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_InformationDepotCabinetRoles_InformationDepotCabinets_information_depot_cabinet_id",
                table: "InformationDepotCabinetRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_InformationDepotCabinets_Cabinets_cabinet_id",
                table: "InformationDepotCabinets");

            migrationBuilder.DropForeignKey(
                name: "FK_InformationDepotCabinets_InformationsDepot_information_depot_id",
                table: "InformationDepotCabinets");

            migrationBuilder.DropForeignKey(
                name: "FK_InformationsDepot_Brevets_id_brevet",
                table: "InformationsDepot");

            migrationBuilder.DropForeignKey(
                name: "FK_InformationsDepot_Pays_id_pays",
                table: "InformationsDepot");

            migrationBuilder.DropForeignKey(
                name: "FK_InformationsDepot_Statuts_id_statuts",
                table: "InformationsDepot");

            migrationBuilder.DropForeignKey(
                name: "FK_InventeurPays_Brevets_id_brevet",
                table: "InventeurPays");

            migrationBuilder.DropForeignKey(
                name: "FK_InventeurPays_Inventeurs_id_inventeur",
                table: "InventeurPays");

            migrationBuilder.DropForeignKey(
                name: "FK_InventeurPays_Pays_id_pays",
                table: "InventeurPays");

            migrationBuilder.DropForeignKey(
                name: "FK_NumeroPays_Pays_PaysId",
                table: "NumeroPays");

            migrationBuilder.DropForeignKey(
                name: "FK_TitulairePays_Brevets_id_brevet",
                table: "TitulairePays");

            migrationBuilder.DropForeignKey(
                name: "FK_TitulairePays_Pays_id_pays",
                table: "TitulairePays");

            migrationBuilder.DropForeignKey(
                name: "FK_TitulairePays_Titulaires_id_titulaire",
                table: "TitulairePays");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Clients_ClientId",
                table: "UserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Roles_RoleId",
                table: "UserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Users_UserId",
                table: "UserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Clients_clientId",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserRoles",
                table: "UserRoles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Titulaires",
                table: "Titulaires");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TitulairePays",
                table: "TitulairePays");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Statuts",
                table: "Statuts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Roles",
                table: "Roles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Pays",
                table: "Pays");

            migrationBuilder.DropPrimaryKey(
                name: "PK_NumeroPays",
                table: "NumeroPays");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Logs",
                table: "Logs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Inventeurs",
                table: "Inventeurs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InventeurPays",
                table: "InventeurPays");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InformationsDepot",
                table: "InformationsDepot");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InformationDepotCabinets",
                table: "InformationDepotCabinets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InformationDepotCabinetRoles",
                table: "InformationDepotCabinetRoles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InformationDepotCabinetContacts",
                table: "InformationDepotCabinetContacts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Deposants",
                table: "Deposants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DeposantPays",
                table: "DeposantPays");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Contacts",
                table: "Contacts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Clients",
                table: "Clients");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ClientCabinets",
                table: "ClientCabinets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Cabinets",
                table: "Cabinets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BrevetTitulaires",
                table: "BrevetTitulaires");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Brevets",
                table: "Brevets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BrevetInventeurs",
                table: "BrevetInventeurs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BrevetDeposants",
                table: "BrevetDeposants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BrevetClients",
                table: "BrevetClients");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BrevetCabinets",
                table: "BrevetCabinets");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "users");

            migrationBuilder.RenameTable(
                name: "UserRoles",
                newName: "userroles");

            migrationBuilder.RenameTable(
                name: "Titulaires",
                newName: "titulaires");

            migrationBuilder.RenameTable(
                name: "TitulairePays",
                newName: "titulairepays");

            migrationBuilder.RenameTable(
                name: "Statuts",
                newName: "statuts");

            migrationBuilder.RenameTable(
                name: "Roles",
                newName: "roles");

            migrationBuilder.RenameTable(
                name: "Pays",
                newName: "pays");

            migrationBuilder.RenameTable(
                name: "NumeroPays",
                newName: "numeropays");

            migrationBuilder.RenameTable(
                name: "Logs",
                newName: "logs");

            migrationBuilder.RenameTable(
                name: "Inventeurs",
                newName: "inventeurs");

            migrationBuilder.RenameTable(
                name: "InventeurPays",
                newName: "inventeurpays");

            migrationBuilder.RenameTable(
                name: "InformationsDepot",
                newName: "informationsdepot");

            migrationBuilder.RenameTable(
                name: "InformationDepotCabinets",
                newName: "informationdepotcabinets");

            migrationBuilder.RenameTable(
                name: "InformationDepotCabinetRoles",
                newName: "informationdepotcabinetroles");

            migrationBuilder.RenameTable(
                name: "InformationDepotCabinetContacts",
                newName: "informationdepotcabinetcontacts");

            migrationBuilder.RenameTable(
                name: "Deposants",
                newName: "deposants");

            migrationBuilder.RenameTable(
                name: "DeposantPays",
                newName: "deposantpays");

            migrationBuilder.RenameTable(
                name: "Contacts",
                newName: "contacts");

            migrationBuilder.RenameTable(
                name: "Clients",
                newName: "clients");

            migrationBuilder.RenameTable(
                name: "ClientCabinets",
                newName: "clientcabinets");

            migrationBuilder.RenameTable(
                name: "Cabinets",
                newName: "cabinets");

            migrationBuilder.RenameTable(
                name: "BrevetTitulaires",
                newName: "brevettitulaires");

            migrationBuilder.RenameTable(
                name: "Brevets",
                newName: "brevets");

            migrationBuilder.RenameTable(
                name: "BrevetInventeurs",
                newName: "brevetinventeurs");

            migrationBuilder.RenameTable(
                name: "BrevetDeposants",
                newName: "brevetdeposants");

            migrationBuilder.RenameTable(
                name: "BrevetClients",
                newName: "brevetclients");

            migrationBuilder.RenameTable(
                name: "BrevetCabinets",
                newName: "brevetcabinets");

            migrationBuilder.RenameColumn(
                name: "updatedAt",
                table: "users",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "lastLogin",
                table: "users",
                newName: "lastlogin");

            migrationBuilder.RenameColumn(
                name: "isBlocked",
                table: "users",
                newName: "isblocked");

            migrationBuilder.RenameColumn(
                name: "isActive",
                table: "users",
                newName: "isactive");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "users",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "clientId",
                table: "users",
                newName: "clientid");

            migrationBuilder.RenameColumn(
                name: "canWrite",
                table: "users",
                newName: "canwrite");

            migrationBuilder.RenameColumn(
                name: "canRead",
                table: "users",
                newName: "canread");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "userroles",
                newName: "userid");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "userroles",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                table: "userroles",
                newName: "roleid");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "userroles",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "ClientId",
                table: "userroles",
                newName: "clientid");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "userroles",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_UserRoles_RoleId",
                table: "userroles",
                newName: "ix_userroles_roleid");

            migrationBuilder.RenameIndex(
                name: "IX_UserRoles_ClientId",
                table: "userroles",
                newName: "ix_userroles_clientid");

            migrationBuilder.RenameColumn(
                name: "updatedAt",
                table: "titulaires",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "titulaires",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "titulairepays",
                newName: "createdat");

            migrationBuilder.RenameIndex(
                name: "IX_TitulairePays_id_titulaire",
                table: "titulairepays",
                newName: "ix_titulairepays_id_titulaire");

            migrationBuilder.RenameIndex(
                name: "IX_TitulairePays_id_pays",
                table: "titulairepays",
                newName: "ix_titulairepays_id_pays");

            migrationBuilder.RenameIndex(
                name: "IX_TitulairePays_id_brevet",
                table: "titulairepays",
                newName: "ix_titulairepays_id_brevet");

            migrationBuilder.RenameColumn(
                name: "updatedAt",
                table: "statuts",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "statuts",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "roles",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "roles",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "roles",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "roles",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "roles",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "updatedAt",
                table: "pays",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "pays",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "PaysId",
                table: "numeropays",
                newName: "paysid");

            migrationBuilder.RenameIndex(
                name: "IX_NumeroPays_PaysId",
                table: "numeropays",
                newName: "ix_numeropays_paysid");

            migrationBuilder.RenameColumn(
                name: "userId",
                table: "logs",
                newName: "userid");

            migrationBuilder.RenameColumn(
                name: "updatedAt",
                table: "inventeurs",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "inventeurs",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "inventeurpays",
                newName: "createdat");

            migrationBuilder.RenameIndex(
                name: "IX_InventeurPays_id_pays",
                table: "inventeurpays",
                newName: "ix_inventeurpays_id_pays");

            migrationBuilder.RenameIndex(
                name: "IX_InventeurPays_id_inventeur",
                table: "inventeurpays",
                newName: "ix_inventeurpays_id_inventeur");

            migrationBuilder.RenameIndex(
                name: "IX_InventeurPays_id_brevet",
                table: "inventeurpays",
                newName: "ix_inventeurpays_id_brevet");

            migrationBuilder.RenameColumn(
                name: "updatedAt",
                table: "informationsdepot",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "informationsdepot",
                newName: "createdat");

            migrationBuilder.RenameIndex(
                name: "IX_InformationsDepot_id_statuts",
                table: "informationsdepot",
                newName: "ix_informationsdepot_id_statuts");

            migrationBuilder.RenameIndex(
                name: "IX_InformationsDepot_id_pays",
                table: "informationsdepot",
                newName: "ix_informationsdepot_id_pays");

            migrationBuilder.RenameIndex(
                name: "IX_InformationsDepot_id_brevet",
                table: "informationsdepot",
                newName: "ix_informationsdepot_id_brevet");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "informationdepotcabinets",
                newName: "createdat");

            migrationBuilder.RenameIndex(
                name: "IX_InformationDepotCabinets_cabinet_id",
                table: "informationdepotcabinets",
                newName: "ix_informationdepotcabinets_cabinet_id");

            migrationBuilder.RenameIndex(
                name: "IX_InformationDepotCabinetContacts_contact_id",
                table: "informationdepotcabinetcontacts",
                newName: "ix_informationdepotcabinetcontacts_contact_id");

            migrationBuilder.RenameColumn(
                name: "updatedAt",
                table: "deposants",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "deposants",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "deposantpays",
                newName: "createdat");

            migrationBuilder.RenameIndex(
                name: "IX_DeposantPays_id_pays",
                table: "deposantpays",
                newName: "ix_deposantpays_id_pays");

            migrationBuilder.RenameIndex(
                name: "IX_DeposantPays_id_deposant",
                table: "deposantpays",
                newName: "ix_deposantpays_id_deposant");

            migrationBuilder.RenameIndex(
                name: "IX_DeposantPays_id_brevet",
                table: "deposantpays",
                newName: "ix_deposantpays_id_brevet");

            migrationBuilder.RenameColumn(
                name: "updatedAt",
                table: "contacts",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "contacts",
                newName: "createdat");

            migrationBuilder.RenameIndex(
                name: "IX_Contacts_id_client",
                table: "contacts",
                newName: "ix_contacts_id_client");

            migrationBuilder.RenameIndex(
                name: "IX_Contacts_id_cabinet",
                table: "contacts",
                newName: "ix_contacts_id_cabinet");

            migrationBuilder.RenameColumn(
                name: "updatedAt",
                table: "clients",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "clients",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "clientcabinets",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "clientcabinets",
                newName: "type");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "clientcabinets",
                newName: "isactive");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "clientcabinets",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "ClientId",
                table: "clientcabinets",
                newName: "clientid");

            migrationBuilder.RenameColumn(
                name: "CabinetId",
                table: "clientcabinets",
                newName: "cabinetid");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "clientcabinets",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_ClientCabinets_CabinetId",
                table: "clientcabinets",
                newName: "ix_clientcabinets_cabinetid");

            migrationBuilder.RenameColumn(
                name: "updatedAt",
                table: "cabinets",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "cabinets",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "brevettitulaires",
                newName: "createdat");

            migrationBuilder.RenameIndex(
                name: "IX_BrevetTitulaires_id_titulaire",
                table: "brevettitulaires",
                newName: "ix_brevettitulaires_id_titulaire");

            migrationBuilder.RenameColumn(
                name: "updatedAt",
                table: "brevets",
                newName: "updatedat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "brevets",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "brevetinventeurs",
                newName: "createdat");

            migrationBuilder.RenameIndex(
                name: "IX_BrevetInventeurs_id_inventeur",
                table: "brevetinventeurs",
                newName: "ix_brevetinventeurs_id_inventeur");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "brevetdeposants",
                newName: "createdat");

            migrationBuilder.RenameIndex(
                name: "IX_BrevetDeposants_id_deposant",
                table: "brevetdeposants",
                newName: "ix_brevetdeposants_id_deposant");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "brevetclients",
                newName: "createdat");

            migrationBuilder.RenameIndex(
                name: "IX_BrevetClients_id_client",
                table: "brevetclients",
                newName: "ix_brevetclients_id_client");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "brevetcabinets",
                newName: "createdat");

            migrationBuilder.RenameIndex(
                name: "IX_BrevetCabinets_id_cabinet",
                table: "brevetcabinets",
                newName: "ix_brevetcabinets_id_cabinet");

            migrationBuilder.RenameIndex(
                name: "IX_BrevetCabinets_id_brevet",
                table: "brevetcabinets",
                newName: "ix_brevetcabinets_id_brevet");

            migrationBuilder.AlterColumn<string>(
                name: "username",
                table: "users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "role",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "user",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldDefaultValue: "user");

            migrationBuilder.AlterColumn<string>(
                name: "prenom",
                table: "users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "password",
                table: "users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "nom",
                table: "users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "lastlogin",
                table: "users",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "isblocked",
                table: "users",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "isactive",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 1);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "clientid",
                table: "users",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "canwrite",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "canread",
                table: "users",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "users",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "userid",
                table: "userroles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "userroles",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "roleid",
                table: "userroles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "userroles",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "clientid",
                table: "userroles",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "userroles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "titulaires",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "telephone",
                table: "titulaires",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "prenom",
                table: "titulaires",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom",
                table: "titulaires",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "titulaires",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "titulaires",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "adresse",
                table: "titulaires",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "titulaires",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_titulaire",
                table: "titulairepays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id_pays",
                table: "titulairepays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "titulairepays",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "titulairepays",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "titulairepays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "statuts",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "statuts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "statuts",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "statuts",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "roles",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "roles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "roles",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "roles",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "roles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "pays",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "nom_fr_fr",
                table: "pays",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "pays",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "code_iso3",
                table: "pays",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "code_iso",
                table: "pays",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "pays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updated_at",
                table: "numeropays",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "pays_code",
                table: "numeropays",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<string>(
                name: "numero",
                table: "numeropays",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "is_active",
                table: "numeropays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "numeropays",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "created_at",
                table: "numeropays",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "paysid",
                table: "numeropays",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "numeropays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "user_agent",
                table: "logs",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "userid",
                table: "logs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "timestamp",
                table: "logs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "table_name",
                table: "logs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "record_id",
                table: "logs",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "old_values",
                table: "logs",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "new_values",
                table: "logs",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "message",
                table: "logs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "level",
                table: "logs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "ip_address",
                table: "logs",
                type: "character varying(45)",
                maxLength: 45,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 45,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "details",
                table: "logs",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "created_at",
                table: "logs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "action",
                table: "logs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "logs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "inventeurs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "telephone",
                table: "inventeurs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "prenom",
                table: "inventeurs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom",
                table: "inventeurs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "inventeurs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "inventeurs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "adresse",
                table: "inventeurs",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "inventeurs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_pays",
                table: "inventeurpays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id_inventeur",
                table: "inventeurpays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "inventeurpays",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "inventeurpays",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "inventeurpays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "informationsdepot",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "numero_publication",
                table: "informationsdepot",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "numero_depot",
                table: "informationsdepot",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "numero_delivrance",
                table: "informationsdepot",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "licence",
                table: "informationsdepot",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "id_statuts",
                table: "informationsdepot",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_pays",
                table: "informationsdepot",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "informationsdepot",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "date_publication",
                table: "informationsdepot",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "date_depot",
                table: "informationsdepot",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "date_delivrance",
                table: "informationsdepot",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "informationsdepot",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "commentaire",
                table: "informationsdepot",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "informationsdepot",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "information_depot_id",
                table: "informationdepotcabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "informationdepotcabinets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "category",
                table: "informationdepotcabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "cabinet_id",
                table: "informationdepotcabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "informationdepotcabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "role",
                table: "informationdepotcabinetroles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "information_depot_cabinet_id",
                table: "informationdepotcabinetroles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "informationdepotcabinetroles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "information_depot_cabinet_id",
                table: "informationdepotcabinetcontacts",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "contact_id",
                table: "informationdepotcabinetcontacts",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "informationdepotcabinetcontacts",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "deposants",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "telephone",
                table: "deposants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "prenom",
                table: "deposants",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom",
                table: "deposants",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "deposants",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "deposants",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "adresse",
                table: "deposants",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "deposants",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_pays",
                table: "deposantpays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id_deposant",
                table: "deposantpays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "deposantpays",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "deposantpays",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "deposantpays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "contacts",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "telephone",
                table: "contacts",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "role",
                table: "contacts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "prenom",
                table: "contacts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom",
                table: "contacts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_client",
                table: "contacts",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_cabinet",
                table: "contacts",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "contacts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "contacts",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "contacts",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "clients",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "telephone_client",
                table: "clients",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "reference_client",
                table: "clients",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "pays_client",
                table: "clients",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom_client",
                table: "clients",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<int>(
                name: "is_blocked",
                table: "clients",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "email_client",
                table: "clients",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "clients",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "code_postal",
                table: "clients",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "can_write",
                table: "clients",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "can_read",
                table: "clients",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "adresse_client",
                table: "clients",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "clients",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "clientcabinets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "type",
                table: "clientcabinets",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "isactive",
                table: "clientcabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "clientcabinets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "clientid",
                table: "clientcabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "cabinetid",
                table: "clientcabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "clientcabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "cabinets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "type",
                table: "cabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "telephone_cabinet",
                table: "cabinets",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "pays_cabinet",
                table: "cabinets",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom_cabinet",
                table: "cabinets",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "email_cabinet",
                table: "cabinets",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "cabinets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "code_postal",
                table: "cabinets",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "adresse_cabinet",
                table: "cabinets",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "cabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_titulaire",
                table: "brevettitulaires",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "brevettitulaires",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "brevettitulaires",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "brevettitulaires",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedat",
                table: "brevets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "titre",
                table: "brevets",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "reference_famille",
                table: "brevets",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "brevets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "commentaire",
                table: "brevets",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "brevets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_inventeur",
                table: "brevetinventeurs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "brevetinventeurs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "brevetinventeurs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "brevetinventeurs",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_deposant",
                table: "brevetdeposants",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "brevetdeposants",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "brevetdeposants",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "brevetdeposants",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_client",
                table: "brevetclients",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "brevetclients",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "brevetclients",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "brevetclients",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_cabinet",
                table: "brevetcabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "brevetcabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "createdat",
                table: "brevetcabinets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "brevetcabinets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "pk_users",
                table: "users",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_userroles",
                table: "userroles",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_titulaires",
                table: "titulaires",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_titulairepays",
                table: "titulairepays",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_statuts",
                table: "statuts",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_roles",
                table: "roles",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_pays",
                table: "pays",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_numeropays",
                table: "numeropays",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_logs",
                table: "logs",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_inventeurs",
                table: "inventeurs",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_inventeurpays",
                table: "inventeurpays",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_informationsdepot",
                table: "informationsdepot",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_informationdepotcabinets",
                table: "informationdepotcabinets",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_informationdepotcabinetroles",
                table: "informationdepotcabinetroles",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_informationdepotcabinetcontacts",
                table: "informationdepotcabinetcontacts",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_deposants",
                table: "deposants",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_deposantpays",
                table: "deposantpays",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_contacts",
                table: "contacts",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_clients",
                table: "clients",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_clientcabinets",
                table: "clientcabinets",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_cabinets",
                table: "cabinets",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_brevettitulaires",
                table: "brevettitulaires",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_brevets",
                table: "brevets",
                column: "id_brevet");

            migrationBuilder.AddPrimaryKey(
                name: "pk_brevetinventeurs",
                table: "brevetinventeurs",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_brevetdeposants",
                table: "brevetdeposants",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_brevetclients",
                table: "brevetclients",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_brevetcabinets",
                table: "brevetcabinets",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_brevetcabinets_brevets_id_brevet",
                table: "brevetcabinets",
                column: "id_brevet",
                principalTable: "brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_brevetcabinets_cabinets_id_cabinet",
                table: "brevetcabinets",
                column: "id_cabinet",
                principalTable: "cabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_brevetclients_brevets_id_brevet",
                table: "brevetclients",
                column: "id_brevet",
                principalTable: "brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_brevetclients_clients_id_client",
                table: "brevetclients",
                column: "id_client",
                principalTable: "clients",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_brevetdeposants_brevets_id_brevet",
                table: "brevetdeposants",
                column: "id_brevet",
                principalTable: "brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_brevetdeposants_deposants_id_deposant",
                table: "brevetdeposants",
                column: "id_deposant",
                principalTable: "deposants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_brevetinventeurs_brevets_id_brevet",
                table: "brevetinventeurs",
                column: "id_brevet",
                principalTable: "brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_brevetinventeurs_inventeurs_id_inventeur",
                table: "brevetinventeurs",
                column: "id_inventeur",
                principalTable: "inventeurs",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_brevettitulaires_brevets_id_brevet",
                table: "brevettitulaires",
                column: "id_brevet",
                principalTable: "brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_brevettitulaires_titulaires_id_titulaire",
                table: "brevettitulaires",
                column: "id_titulaire",
                principalTable: "titulaires",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_clientcabinets_cabinets_cabinetid",
                table: "clientcabinets",
                column: "cabinetid",
                principalTable: "cabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_clientcabinets_clients_clientid",
                table: "clientcabinets",
                column: "clientid",
                principalTable: "clients",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_contacts_cabinets_id_cabinet",
                table: "contacts",
                column: "id_cabinet",
                principalTable: "cabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_contacts_clients_id_client",
                table: "contacts",
                column: "id_client",
                principalTable: "clients",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_deposantpays_brevets_id_brevet",
                table: "deposantpays",
                column: "id_brevet",
                principalTable: "brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_deposantpays_deposants_id_deposant",
                table: "deposantpays",
                column: "id_deposant",
                principalTable: "deposants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_deposantpays_pays_id_pays",
                table: "deposantpays",
                column: "id_pays",
                principalTable: "pays",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_informationdepotcabinetcontacts_contacts_contact_id",
                table: "informationdepotcabinetcontacts",
                column: "contact_id",
                principalTable: "contacts",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_informationdepotcabinetcontacts_informationdepotcabinets_in~",
                table: "informationdepotcabinetcontacts",
                column: "information_depot_cabinet_id",
                principalTable: "informationdepotcabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_informationdepotcabinetroles_informationdepotcabinets_infor~",
                table: "informationdepotcabinetroles",
                column: "information_depot_cabinet_id",
                principalTable: "informationdepotcabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_informationdepotcabinets_cabinets_cabinet_id",
                table: "informationdepotcabinets",
                column: "cabinet_id",
                principalTable: "cabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_informationdepotcabinets_informationsdepot_information_depo~",
                table: "informationdepotcabinets",
                column: "information_depot_id",
                principalTable: "informationsdepot",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_informationsdepot_brevets_id_brevet",
                table: "informationsdepot",
                column: "id_brevet",
                principalTable: "brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_informationsdepot_pays_id_pays",
                table: "informationsdepot",
                column: "id_pays",
                principalTable: "pays",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_informationsdepot_statuts_id_statuts",
                table: "informationsdepot",
                column: "id_statuts",
                principalTable: "statuts",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_inventeurpays_brevets_id_brevet",
                table: "inventeurpays",
                column: "id_brevet",
                principalTable: "brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_inventeurpays_inventeurs_id_inventeur",
                table: "inventeurpays",
                column: "id_inventeur",
                principalTable: "inventeurs",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_inventeurpays_pays_id_pays",
                table: "inventeurpays",
                column: "id_pays",
                principalTable: "pays",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_numeropays_pays_paysid",
                table: "numeropays",
                column: "paysid",
                principalTable: "pays",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_titulairepays_brevets_id_brevet",
                table: "titulairepays",
                column: "id_brevet",
                principalTable: "brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_titulairepays_pays_id_pays",
                table: "titulairepays",
                column: "id_pays",
                principalTable: "pays",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_titulairepays_titulaires_id_titulaire",
                table: "titulairepays",
                column: "id_titulaire",
                principalTable: "titulaires",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_userroles_clients_clientid",
                table: "userroles",
                column: "clientid",
                principalTable: "clients",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_userroles_roles_roleid",
                table: "userroles",
                column: "roleid",
                principalTable: "roles",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_userroles_users_userid",
                table: "userroles",
                column: "userid",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_users_clients_clientid",
                table: "users",
                column: "clientid",
                principalTable: "clients",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_brevetcabinets_brevets_id_brevet",
                table: "brevetcabinets");

            migrationBuilder.DropForeignKey(
                name: "fk_brevetcabinets_cabinets_id_cabinet",
                table: "brevetcabinets");

            migrationBuilder.DropForeignKey(
                name: "fk_brevetclients_brevets_id_brevet",
                table: "brevetclients");

            migrationBuilder.DropForeignKey(
                name: "fk_brevetclients_clients_id_client",
                table: "brevetclients");

            migrationBuilder.DropForeignKey(
                name: "fk_brevetdeposants_brevets_id_brevet",
                table: "brevetdeposants");

            migrationBuilder.DropForeignKey(
                name: "fk_brevetdeposants_deposants_id_deposant",
                table: "brevetdeposants");

            migrationBuilder.DropForeignKey(
                name: "fk_brevetinventeurs_brevets_id_brevet",
                table: "brevetinventeurs");

            migrationBuilder.DropForeignKey(
                name: "fk_brevetinventeurs_inventeurs_id_inventeur",
                table: "brevetinventeurs");

            migrationBuilder.DropForeignKey(
                name: "fk_brevettitulaires_brevets_id_brevet",
                table: "brevettitulaires");

            migrationBuilder.DropForeignKey(
                name: "fk_brevettitulaires_titulaires_id_titulaire",
                table: "brevettitulaires");

            migrationBuilder.DropForeignKey(
                name: "fk_clientcabinets_cabinets_cabinetid",
                table: "clientcabinets");

            migrationBuilder.DropForeignKey(
                name: "fk_clientcabinets_clients_clientid",
                table: "clientcabinets");

            migrationBuilder.DropForeignKey(
                name: "fk_contacts_cabinets_id_cabinet",
                table: "contacts");

            migrationBuilder.DropForeignKey(
                name: "fk_contacts_clients_id_client",
                table: "contacts");

            migrationBuilder.DropForeignKey(
                name: "fk_deposantpays_brevets_id_brevet",
                table: "deposantpays");

            migrationBuilder.DropForeignKey(
                name: "fk_deposantpays_deposants_id_deposant",
                table: "deposantpays");

            migrationBuilder.DropForeignKey(
                name: "fk_deposantpays_pays_id_pays",
                table: "deposantpays");

            migrationBuilder.DropForeignKey(
                name: "fk_informationdepotcabinetcontacts_contacts_contact_id",
                table: "informationdepotcabinetcontacts");

            migrationBuilder.DropForeignKey(
                name: "fk_informationdepotcabinetcontacts_informationdepotcabinets_in~",
                table: "informationdepotcabinetcontacts");

            migrationBuilder.DropForeignKey(
                name: "fk_informationdepotcabinetroles_informationdepotcabinets_infor~",
                table: "informationdepotcabinetroles");

            migrationBuilder.DropForeignKey(
                name: "fk_informationdepotcabinets_cabinets_cabinet_id",
                table: "informationdepotcabinets");

            migrationBuilder.DropForeignKey(
                name: "fk_informationdepotcabinets_informationsdepot_information_depo~",
                table: "informationdepotcabinets");

            migrationBuilder.DropForeignKey(
                name: "fk_informationsdepot_brevets_id_brevet",
                table: "informationsdepot");

            migrationBuilder.DropForeignKey(
                name: "fk_informationsdepot_pays_id_pays",
                table: "informationsdepot");

            migrationBuilder.DropForeignKey(
                name: "fk_informationsdepot_statuts_id_statuts",
                table: "informationsdepot");

            migrationBuilder.DropForeignKey(
                name: "fk_inventeurpays_brevets_id_brevet",
                table: "inventeurpays");

            migrationBuilder.DropForeignKey(
                name: "fk_inventeurpays_inventeurs_id_inventeur",
                table: "inventeurpays");

            migrationBuilder.DropForeignKey(
                name: "fk_inventeurpays_pays_id_pays",
                table: "inventeurpays");

            migrationBuilder.DropForeignKey(
                name: "fk_numeropays_pays_paysid",
                table: "numeropays");

            migrationBuilder.DropForeignKey(
                name: "fk_titulairepays_brevets_id_brevet",
                table: "titulairepays");

            migrationBuilder.DropForeignKey(
                name: "fk_titulairepays_pays_id_pays",
                table: "titulairepays");

            migrationBuilder.DropForeignKey(
                name: "fk_titulairepays_titulaires_id_titulaire",
                table: "titulairepays");

            migrationBuilder.DropForeignKey(
                name: "fk_userroles_clients_clientid",
                table: "userroles");

            migrationBuilder.DropForeignKey(
                name: "fk_userroles_roles_roleid",
                table: "userroles");

            migrationBuilder.DropForeignKey(
                name: "fk_userroles_users_userid",
                table: "userroles");

            migrationBuilder.DropForeignKey(
                name: "fk_users_clients_clientid",
                table: "users");

            migrationBuilder.DropPrimaryKey(
                name: "pk_users",
                table: "users");

            migrationBuilder.DropPrimaryKey(
                name: "pk_userroles",
                table: "userroles");

            migrationBuilder.DropPrimaryKey(
                name: "pk_titulaires",
                table: "titulaires");

            migrationBuilder.DropPrimaryKey(
                name: "pk_titulairepays",
                table: "titulairepays");

            migrationBuilder.DropPrimaryKey(
                name: "pk_statuts",
                table: "statuts");

            migrationBuilder.DropPrimaryKey(
                name: "pk_roles",
                table: "roles");

            migrationBuilder.DropPrimaryKey(
                name: "pk_pays",
                table: "pays");

            migrationBuilder.DropPrimaryKey(
                name: "pk_numeropays",
                table: "numeropays");

            migrationBuilder.DropPrimaryKey(
                name: "pk_logs",
                table: "logs");

            migrationBuilder.DropPrimaryKey(
                name: "pk_inventeurs",
                table: "inventeurs");

            migrationBuilder.DropPrimaryKey(
                name: "pk_inventeurpays",
                table: "inventeurpays");

            migrationBuilder.DropPrimaryKey(
                name: "pk_informationsdepot",
                table: "informationsdepot");

            migrationBuilder.DropPrimaryKey(
                name: "pk_informationdepotcabinets",
                table: "informationdepotcabinets");

            migrationBuilder.DropPrimaryKey(
                name: "pk_informationdepotcabinetroles",
                table: "informationdepotcabinetroles");

            migrationBuilder.DropPrimaryKey(
                name: "pk_informationdepotcabinetcontacts",
                table: "informationdepotcabinetcontacts");

            migrationBuilder.DropPrimaryKey(
                name: "pk_deposants",
                table: "deposants");

            migrationBuilder.DropPrimaryKey(
                name: "pk_deposantpays",
                table: "deposantpays");

            migrationBuilder.DropPrimaryKey(
                name: "pk_contacts",
                table: "contacts");

            migrationBuilder.DropPrimaryKey(
                name: "pk_clients",
                table: "clients");

            migrationBuilder.DropPrimaryKey(
                name: "pk_clientcabinets",
                table: "clientcabinets");

            migrationBuilder.DropPrimaryKey(
                name: "pk_cabinets",
                table: "cabinets");

            migrationBuilder.DropPrimaryKey(
                name: "pk_brevettitulaires",
                table: "brevettitulaires");

            migrationBuilder.DropPrimaryKey(
                name: "pk_brevets",
                table: "brevets");

            migrationBuilder.DropPrimaryKey(
                name: "pk_brevetinventeurs",
                table: "brevetinventeurs");

            migrationBuilder.DropPrimaryKey(
                name: "pk_brevetdeposants",
                table: "brevetdeposants");

            migrationBuilder.DropPrimaryKey(
                name: "pk_brevetclients",
                table: "brevetclients");

            migrationBuilder.DropPrimaryKey(
                name: "pk_brevetcabinets",
                table: "brevetcabinets");

            migrationBuilder.RenameTable(
                name: "users",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "userroles",
                newName: "UserRoles");

            migrationBuilder.RenameTable(
                name: "titulaires",
                newName: "Titulaires");

            migrationBuilder.RenameTable(
                name: "titulairepays",
                newName: "TitulairePays");

            migrationBuilder.RenameTable(
                name: "statuts",
                newName: "Statuts");

            migrationBuilder.RenameTable(
                name: "roles",
                newName: "Roles");

            migrationBuilder.RenameTable(
                name: "pays",
                newName: "Pays");

            migrationBuilder.RenameTable(
                name: "numeropays",
                newName: "NumeroPays");

            migrationBuilder.RenameTable(
                name: "logs",
                newName: "Logs");

            migrationBuilder.RenameTable(
                name: "inventeurs",
                newName: "Inventeurs");

            migrationBuilder.RenameTable(
                name: "inventeurpays",
                newName: "InventeurPays");

            migrationBuilder.RenameTable(
                name: "informationsdepot",
                newName: "InformationsDepot");

            migrationBuilder.RenameTable(
                name: "informationdepotcabinets",
                newName: "InformationDepotCabinets");

            migrationBuilder.RenameTable(
                name: "informationdepotcabinetroles",
                newName: "InformationDepotCabinetRoles");

            migrationBuilder.RenameTable(
                name: "informationdepotcabinetcontacts",
                newName: "InformationDepotCabinetContacts");

            migrationBuilder.RenameTable(
                name: "deposants",
                newName: "Deposants");

            migrationBuilder.RenameTable(
                name: "deposantpays",
                newName: "DeposantPays");

            migrationBuilder.RenameTable(
                name: "contacts",
                newName: "Contacts");

            migrationBuilder.RenameTable(
                name: "clients",
                newName: "Clients");

            migrationBuilder.RenameTable(
                name: "clientcabinets",
                newName: "ClientCabinets");

            migrationBuilder.RenameTable(
                name: "cabinets",
                newName: "Cabinets");

            migrationBuilder.RenameTable(
                name: "brevettitulaires",
                newName: "BrevetTitulaires");

            migrationBuilder.RenameTable(
                name: "brevets",
                newName: "Brevets");

            migrationBuilder.RenameTable(
                name: "brevetinventeurs",
                newName: "BrevetInventeurs");

            migrationBuilder.RenameTable(
                name: "brevetdeposants",
                newName: "BrevetDeposants");

            migrationBuilder.RenameTable(
                name: "brevetclients",
                newName: "BrevetClients");

            migrationBuilder.RenameTable(
                name: "brevetcabinets",
                newName: "BrevetCabinets");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Users",
                newName: "updatedAt");

            migrationBuilder.RenameColumn(
                name: "lastlogin",
                table: "Users",
                newName: "lastLogin");

            migrationBuilder.RenameColumn(
                name: "isblocked",
                table: "Users",
                newName: "isBlocked");

            migrationBuilder.RenameColumn(
                name: "isactive",
                table: "Users",
                newName: "isActive");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Users",
                newName: "createdAt");

            migrationBuilder.RenameColumn(
                name: "clientid",
                table: "Users",
                newName: "clientId");

            migrationBuilder.RenameColumn(
                name: "canwrite",
                table: "Users",
                newName: "canWrite");

            migrationBuilder.RenameColumn(
                name: "canread",
                table: "Users",
                newName: "canRead");

            migrationBuilder.RenameColumn(
                name: "userid",
                table: "UserRoles",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "UserRoles",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "roleid",
                table: "UserRoles",
                newName: "RoleId");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "UserRoles",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "clientid",
                table: "UserRoles",
                newName: "ClientId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "UserRoles",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "ix_userroles_roleid",
                table: "UserRoles",
                newName: "IX_UserRoles_RoleId");

            migrationBuilder.RenameIndex(
                name: "ix_userroles_clientid",
                table: "UserRoles",
                newName: "IX_UserRoles_ClientId");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Titulaires",
                newName: "updatedAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Titulaires",
                newName: "createdAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "TitulairePays",
                newName: "createdAt");

            migrationBuilder.RenameIndex(
                name: "ix_titulairepays_id_titulaire",
                table: "TitulairePays",
                newName: "IX_TitulairePays_id_titulaire");

            migrationBuilder.RenameIndex(
                name: "ix_titulairepays_id_pays",
                table: "TitulairePays",
                newName: "IX_TitulairePays_id_pays");

            migrationBuilder.RenameIndex(
                name: "ix_titulairepays_id_brevet",
                table: "TitulairePays",
                newName: "IX_TitulairePays_id_brevet");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Statuts",
                newName: "updatedAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Statuts",
                newName: "createdAt");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Roles",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Roles",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "Roles",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Roles",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Roles",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Pays",
                newName: "updatedAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Pays",
                newName: "createdAt");

            migrationBuilder.RenameColumn(
                name: "paysid",
                table: "NumeroPays",
                newName: "PaysId");

            migrationBuilder.RenameIndex(
                name: "ix_numeropays_paysid",
                table: "NumeroPays",
                newName: "IX_NumeroPays_PaysId");

            migrationBuilder.RenameColumn(
                name: "userid",
                table: "Logs",
                newName: "userId");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Inventeurs",
                newName: "updatedAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Inventeurs",
                newName: "createdAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "InventeurPays",
                newName: "createdAt");

            migrationBuilder.RenameIndex(
                name: "ix_inventeurpays_id_pays",
                table: "InventeurPays",
                newName: "IX_InventeurPays_id_pays");

            migrationBuilder.RenameIndex(
                name: "ix_inventeurpays_id_inventeur",
                table: "InventeurPays",
                newName: "IX_InventeurPays_id_inventeur");

            migrationBuilder.RenameIndex(
                name: "ix_inventeurpays_id_brevet",
                table: "InventeurPays",
                newName: "IX_InventeurPays_id_brevet");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "InformationsDepot",
                newName: "updatedAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "InformationsDepot",
                newName: "createdAt");

            migrationBuilder.RenameIndex(
                name: "ix_informationsdepot_id_statuts",
                table: "InformationsDepot",
                newName: "IX_InformationsDepot_id_statuts");

            migrationBuilder.RenameIndex(
                name: "ix_informationsdepot_id_pays",
                table: "InformationsDepot",
                newName: "IX_InformationsDepot_id_pays");

            migrationBuilder.RenameIndex(
                name: "ix_informationsdepot_id_brevet",
                table: "InformationsDepot",
                newName: "IX_InformationsDepot_id_brevet");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "InformationDepotCabinets",
                newName: "createdAt");

            migrationBuilder.RenameIndex(
                name: "ix_informationdepotcabinets_cabinet_id",
                table: "InformationDepotCabinets",
                newName: "IX_InformationDepotCabinets_cabinet_id");

            migrationBuilder.RenameIndex(
                name: "ix_informationdepotcabinetcontacts_contact_id",
                table: "InformationDepotCabinetContacts",
                newName: "IX_InformationDepotCabinetContacts_contact_id");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Deposants",
                newName: "updatedAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Deposants",
                newName: "createdAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "DeposantPays",
                newName: "createdAt");

            migrationBuilder.RenameIndex(
                name: "ix_deposantpays_id_pays",
                table: "DeposantPays",
                newName: "IX_DeposantPays_id_pays");

            migrationBuilder.RenameIndex(
                name: "ix_deposantpays_id_deposant",
                table: "DeposantPays",
                newName: "IX_DeposantPays_id_deposant");

            migrationBuilder.RenameIndex(
                name: "ix_deposantpays_id_brevet",
                table: "DeposantPays",
                newName: "IX_DeposantPays_id_brevet");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Contacts",
                newName: "updatedAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Contacts",
                newName: "createdAt");

            migrationBuilder.RenameIndex(
                name: "ix_contacts_id_client",
                table: "Contacts",
                newName: "IX_Contacts_id_client");

            migrationBuilder.RenameIndex(
                name: "ix_contacts_id_cabinet",
                table: "Contacts",
                newName: "IX_Contacts_id_cabinet");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Clients",
                newName: "updatedAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Clients",
                newName: "createdAt");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "ClientCabinets",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "type",
                table: "ClientCabinets",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "isactive",
                table: "ClientCabinets",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "ClientCabinets",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "clientid",
                table: "ClientCabinets",
                newName: "ClientId");

            migrationBuilder.RenameColumn(
                name: "cabinetid",
                table: "ClientCabinets",
                newName: "CabinetId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "ClientCabinets",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "ix_clientcabinets_cabinetid",
                table: "ClientCabinets",
                newName: "IX_ClientCabinets_CabinetId");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Cabinets",
                newName: "updatedAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Cabinets",
                newName: "createdAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "BrevetTitulaires",
                newName: "createdAt");

            migrationBuilder.RenameIndex(
                name: "ix_brevettitulaires_id_titulaire",
                table: "BrevetTitulaires",
                newName: "IX_BrevetTitulaires_id_titulaire");

            migrationBuilder.RenameColumn(
                name: "updatedat",
                table: "Brevets",
                newName: "updatedAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Brevets",
                newName: "createdAt");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "BrevetInventeurs",
                newName: "createdAt");

            migrationBuilder.RenameIndex(
                name: "ix_brevetinventeurs_id_inventeur",
                table: "BrevetInventeurs",
                newName: "IX_BrevetInventeurs_id_inventeur");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "BrevetDeposants",
                newName: "createdAt");

            migrationBuilder.RenameIndex(
                name: "ix_brevetdeposants_id_deposant",
                table: "BrevetDeposants",
                newName: "IX_BrevetDeposants_id_deposant");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "BrevetClients",
                newName: "createdAt");

            migrationBuilder.RenameIndex(
                name: "ix_brevetclients_id_client",
                table: "BrevetClients",
                newName: "IX_BrevetClients_id_client");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "BrevetCabinets",
                newName: "createdAt");

            migrationBuilder.RenameIndex(
                name: "ix_brevetcabinets_id_cabinet",
                table: "BrevetCabinets",
                newName: "IX_BrevetCabinets_id_cabinet");

            migrationBuilder.RenameIndex(
                name: "ix_brevetcabinets_id_brevet",
                table: "BrevetCabinets",
                newName: "IX_BrevetCabinets_id_brevet");

            migrationBuilder.AlterColumn<string>(
                name: "username",
                table: "Users",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "updatedAt",
                table: "Users",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "role",
                table: "Users",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                defaultValue: "user",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldDefaultValue: "user");

            migrationBuilder.AlterColumn<string>(
                name: "prenom",
                table: "Users",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "password",
                table: "Users",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "nom",
                table: "Users",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "lastLogin",
                table: "Users",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "isBlocked",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "isActive",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 1);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "Users",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "Users",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "clientId",
                table: "Users",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "canWrite",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "canRead",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "UserRoles",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "UpdatedAt",
                table: "UserRoles",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "RoleId",
                table: "UserRoles",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "CreatedAt",
                table: "UserRoles",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "ClientId",
                table: "UserRoles",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "UserRoles",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedAt",
                table: "Titulaires",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "telephone",
                table: "Titulaires",
                type: "TEXT",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "prenom",
                table: "Titulaires",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom",
                table: "Titulaires",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "Titulaires",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "Titulaires",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "adresse",
                table: "Titulaires",
                type: "TEXT",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "Titulaires",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_titulaire",
                table: "TitulairePays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_pays",
                table: "TitulairePays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "TitulairePays",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "TitulairePays",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "TitulairePays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedAt",
                table: "Statuts",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "Statuts",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "Statuts",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "Statuts",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "UpdatedAt",
                table: "Roles",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Roles",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Roles",
                type: "TEXT",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedAt",
                table: "Roles",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Roles",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedAt",
                table: "Pays",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "nom_fr_fr",
                table: "Pays",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "Pays",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "code_iso3",
                table: "Pays",
                type: "TEXT",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "code_iso",
                table: "Pays",
                type: "TEXT",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "Pays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updated_at",
                table: "NumeroPays",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "PaysId",
                table: "NumeroPays",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "pays_code",
                table: "NumeroPays",
                type: "TEXT",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<string>(
                name: "numero",
                table: "NumeroPays",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "is_active",
                table: "NumeroPays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "NumeroPays",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "created_at",
                table: "NumeroPays",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "NumeroPays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "userId",
                table: "Logs",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "user_agent",
                table: "Logs",
                type: "TEXT",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "timestamp",
                table: "Logs",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "table_name",
                table: "Logs",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "record_id",
                table: "Logs",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "old_values",
                table: "Logs",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "new_values",
                table: "Logs",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "message",
                table: "Logs",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "level",
                table: "Logs",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "ip_address",
                table: "Logs",
                type: "TEXT",
                maxLength: 45,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(45)",
                oldMaxLength: 45,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "details",
                table: "Logs",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "created_at",
                table: "Logs",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "action",
                table: "Logs",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "Logs",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedAt",
                table: "Inventeurs",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "telephone",
                table: "Inventeurs",
                type: "TEXT",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "prenom",
                table: "Inventeurs",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom",
                table: "Inventeurs",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "Inventeurs",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "Inventeurs",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "adresse",
                table: "Inventeurs",
                type: "TEXT",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "Inventeurs",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_pays",
                table: "InventeurPays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_inventeur",
                table: "InventeurPays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "InventeurPays",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "InventeurPays",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "InventeurPays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedAt",
                table: "InformationsDepot",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "numero_publication",
                table: "InformationsDepot",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "numero_depot",
                table: "InformationsDepot",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "numero_delivrance",
                table: "InformationsDepot",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "licence",
                table: "InformationsDepot",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "id_statuts",
                table: "InformationsDepot",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_pays",
                table: "InformationsDepot",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "InformationsDepot",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "date_publication",
                table: "InformationsDepot",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "date_depot",
                table: "InformationsDepot",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "date_delivrance",
                table: "InformationsDepot",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "InformationsDepot",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "commentaire",
                table: "InformationsDepot",
                type: "TEXT",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "InformationsDepot",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "information_depot_id",
                table: "InformationDepotCabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "InformationDepotCabinets",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "category",
                table: "InformationDepotCabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "cabinet_id",
                table: "InformationDepotCabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "InformationDepotCabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "role",
                table: "InformationDepotCabinetRoles",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "information_depot_cabinet_id",
                table: "InformationDepotCabinetRoles",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "InformationDepotCabinetRoles",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "information_depot_cabinet_id",
                table: "InformationDepotCabinetContacts",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "contact_id",
                table: "InformationDepotCabinetContacts",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "InformationDepotCabinetContacts",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedAt",
                table: "Deposants",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "telephone",
                table: "Deposants",
                type: "TEXT",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "prenom",
                table: "Deposants",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom",
                table: "Deposants",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "Deposants",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "Deposants",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "adresse",
                table: "Deposants",
                type: "TEXT",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "Deposants",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_pays",
                table: "DeposantPays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_deposant",
                table: "DeposantPays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "DeposantPays",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "DeposantPays",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "DeposantPays",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedAt",
                table: "Contacts",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "telephone",
                table: "Contacts",
                type: "TEXT",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "role",
                table: "Contacts",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "prenom",
                table: "Contacts",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom",
                table: "Contacts",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_client",
                table: "Contacts",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_cabinet",
                table: "Contacts",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "Contacts",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "Contacts",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "Contacts",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedAt",
                table: "Clients",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "telephone_client",
                table: "Clients",
                type: "TEXT",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "reference_client",
                table: "Clients",
                type: "TEXT",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "pays_client",
                table: "Clients",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom_client",
                table: "Clients",
                type: "TEXT",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<int>(
                name: "is_blocked",
                table: "Clients",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "email_client",
                table: "Clients",
                type: "TEXT",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "Clients",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "code_postal",
                table: "Clients",
                type: "TEXT",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "can_write",
                table: "Clients",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "can_read",
                table: "Clients",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "adresse_client",
                table: "Clients",
                type: "TEXT",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "Clients",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "UpdatedAt",
                table: "ClientCabinets",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "ClientCabinets",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "IsActive",
                table: "ClientCabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "CreatedAt",
                table: "ClientCabinets",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "ClientId",
                table: "ClientCabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "CabinetId",
                table: "ClientCabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "ClientCabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedAt",
                table: "Cabinets",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "type",
                table: "Cabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "telephone_cabinet",
                table: "Cabinets",
                type: "TEXT",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "pays_cabinet",
                table: "Cabinets",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nom_cabinet",
                table: "Cabinets",
                type: "TEXT",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "email_cabinet",
                table: "Cabinets",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "Cabinets",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "code_postal",
                table: "Cabinets",
                type: "TEXT",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "adresse_cabinet",
                table: "Cabinets",
                type: "TEXT",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "Cabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_titulaire",
                table: "BrevetTitulaires",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "BrevetTitulaires",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "BrevetTitulaires",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "BrevetTitulaires",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<string>(
                name: "updatedAt",
                table: "Brevets",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "titre",
                table: "Brevets",
                type: "TEXT",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "reference_famille",
                table: "Brevets",
                type: "TEXT",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "Brevets",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "commentaire",
                table: "Brevets",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "Brevets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_inventeur",
                table: "BrevetInventeurs",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "BrevetInventeurs",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "BrevetInventeurs",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "BrevetInventeurs",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_deposant",
                table: "BrevetDeposants",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "BrevetDeposants",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "BrevetDeposants",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "BrevetDeposants",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_client",
                table: "BrevetClients",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "BrevetClients",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "BrevetClients",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "BrevetClients",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "id_cabinet",
                table: "BrevetCabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "id_brevet",
                table: "BrevetCabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "createdAt",
                table: "BrevetCabinets",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "BrevetCabinets",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserRoles",
                table: "UserRoles",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Titulaires",
                table: "Titulaires",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TitulairePays",
                table: "TitulairePays",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Statuts",
                table: "Statuts",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Roles",
                table: "Roles",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Pays",
                table: "Pays",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_NumeroPays",
                table: "NumeroPays",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Logs",
                table: "Logs",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Inventeurs",
                table: "Inventeurs",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InventeurPays",
                table: "InventeurPays",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InformationsDepot",
                table: "InformationsDepot",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InformationDepotCabinets",
                table: "InformationDepotCabinets",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InformationDepotCabinetRoles",
                table: "InformationDepotCabinetRoles",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InformationDepotCabinetContacts",
                table: "InformationDepotCabinetContacts",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Deposants",
                table: "Deposants",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DeposantPays",
                table: "DeposantPays",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Contacts",
                table: "Contacts",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Clients",
                table: "Clients",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ClientCabinets",
                table: "ClientCabinets",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Cabinets",
                table: "Cabinets",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BrevetTitulaires",
                table: "BrevetTitulaires",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Brevets",
                table: "Brevets",
                column: "id_brevet");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BrevetInventeurs",
                table: "BrevetInventeurs",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BrevetDeposants",
                table: "BrevetDeposants",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BrevetClients",
                table: "BrevetClients",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BrevetCabinets",
                table: "BrevetCabinets",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_BrevetCabinets_Brevets_id_brevet",
                table: "BrevetCabinets",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BrevetCabinets_Cabinets_id_cabinet",
                table: "BrevetCabinets",
                column: "id_cabinet",
                principalTable: "Cabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BrevetClients_Brevets_id_brevet",
                table: "BrevetClients",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BrevetClients_Clients_id_client",
                table: "BrevetClients",
                column: "id_client",
                principalTable: "Clients",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BrevetDeposants_Brevets_id_brevet",
                table: "BrevetDeposants",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BrevetDeposants_Deposants_id_deposant",
                table: "BrevetDeposants",
                column: "id_deposant",
                principalTable: "Deposants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BrevetInventeurs_Brevets_id_brevet",
                table: "BrevetInventeurs",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BrevetInventeurs_Inventeurs_id_inventeur",
                table: "BrevetInventeurs",
                column: "id_inventeur",
                principalTable: "Inventeurs",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BrevetTitulaires_Brevets_id_brevet",
                table: "BrevetTitulaires",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BrevetTitulaires_Titulaires_id_titulaire",
                table: "BrevetTitulaires",
                column: "id_titulaire",
                principalTable: "Titulaires",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ClientCabinets_Cabinets_CabinetId",
                table: "ClientCabinets",
                column: "CabinetId",
                principalTable: "Cabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ClientCabinets_Clients_ClientId",
                table: "ClientCabinets",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_Cabinets_id_cabinet",
                table: "Contacts",
                column: "id_cabinet",
                principalTable: "Cabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_Clients_id_client",
                table: "Contacts",
                column: "id_client",
                principalTable: "Clients",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_DeposantPays_Brevets_id_brevet",
                table: "DeposantPays",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_DeposantPays_Deposants_id_deposant",
                table: "DeposantPays",
                column: "id_deposant",
                principalTable: "Deposants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DeposantPays_Pays_id_pays",
                table: "DeposantPays",
                column: "id_pays",
                principalTable: "Pays",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InformationDepotCabinetContacts_Contacts_contact_id",
                table: "InformationDepotCabinetContacts",
                column: "contact_id",
                principalTable: "Contacts",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InformationDepotCabinetContacts_InformationDepotCabinets_information_depot_cabinet_id",
                table: "InformationDepotCabinetContacts",
                column: "information_depot_cabinet_id",
                principalTable: "InformationDepotCabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InformationDepotCabinetRoles_InformationDepotCabinets_information_depot_cabinet_id",
                table: "InformationDepotCabinetRoles",
                column: "information_depot_cabinet_id",
                principalTable: "InformationDepotCabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InformationDepotCabinets_Cabinets_cabinet_id",
                table: "InformationDepotCabinets",
                column: "cabinet_id",
                principalTable: "Cabinets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InformationDepotCabinets_InformationsDepot_information_depot_id",
                table: "InformationDepotCabinets",
                column: "information_depot_id",
                principalTable: "InformationsDepot",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InformationsDepot_Brevets_id_brevet",
                table: "InformationsDepot",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InformationsDepot_Pays_id_pays",
                table: "InformationsDepot",
                column: "id_pays",
                principalTable: "Pays",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_InformationsDepot_Statuts_id_statuts",
                table: "InformationsDepot",
                column: "id_statuts",
                principalTable: "Statuts",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_InventeurPays_Brevets_id_brevet",
                table: "InventeurPays",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_InventeurPays_Inventeurs_id_inventeur",
                table: "InventeurPays",
                column: "id_inventeur",
                principalTable: "Inventeurs",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InventeurPays_Pays_id_pays",
                table: "InventeurPays",
                column: "id_pays",
                principalTable: "Pays",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NumeroPays_Pays_PaysId",
                table: "NumeroPays",
                column: "PaysId",
                principalTable: "Pays",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_TitulairePays_Brevets_id_brevet",
                table: "TitulairePays",
                column: "id_brevet",
                principalTable: "Brevets",
                principalColumn: "id_brevet",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_TitulairePays_Pays_id_pays",
                table: "TitulairePays",
                column: "id_pays",
                principalTable: "Pays",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TitulairePays_Titulaires_id_titulaire",
                table: "TitulairePays",
                column: "id_titulaire",
                principalTable: "Titulaires",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Clients_ClientId",
                table: "UserRoles",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Roles_RoleId",
                table: "UserRoles",
                column: "RoleId",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Users_UserId",
                table: "UserRoles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Clients_clientId",
                table: "Users",
                column: "clientId",
                principalTable: "Clients",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
