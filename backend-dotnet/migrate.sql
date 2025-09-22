CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

CREATE TABLE "Brevets" (
    id_brevet INTEGER NOT NULL,
    reference_famille TEXT,
    titre TEXT,
    commentaire TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Brevets" PRIMARY KEY (id_brevet)
);

CREATE TABLE "Cabinets" (
    id INTEGER NOT NULL,
    nom_cabinet TEXT NOT NULL,
    adresse_cabinet TEXT,
    code_postal TEXT,
    pays_cabinet TEXT,
    email_cabinet TEXT,
    telephone_cabinet TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Cabinets" PRIMARY KEY (id)
);

CREATE TABLE "Clients" (
    id INTEGER NOT NULL,
    nom_client TEXT NOT NULL,
    reference_client TEXT,
    adresse_client TEXT,
    code_postal TEXT,
    pays_client TEXT,
    email_client TEXT,
    telephone_client TEXT,
    can_write INTEGER NOT NULL,
    can_read INTEGER NOT NULL,
    is_blocked INTEGER NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Clients" PRIMARY KEY (id)
);

CREATE TABLE "Deposants" (
    id INTEGER NOT NULL,
    nom TEXT,
    prenom TEXT,
    adresse TEXT,
    telephone TEXT,
    email TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Deposants" PRIMARY KEY (id)
);

CREATE TABLE "Inventeurs" (
    id INTEGER NOT NULL,
    nom TEXT,
    prenom TEXT,
    adresse TEXT,
    telephone TEXT,
    email TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Inventeurs" PRIMARY KEY (id)
);

CREATE TABLE "Logs" (
    id INTEGER NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp timestamp with time zone NOT NULL,
    "userId" TEXT,
    action TEXT,
    table_name TEXT,
    record_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at timestamp with time zone NOT NULL,
    details TEXT,
    CONSTRAINT "PK_Logs" PRIMARY KEY (id)
);

CREATE TABLE "Pays" (
    id INTEGER NOT NULL,
    nom_fr_fr TEXT NOT NULL,
    code_iso TEXT,
    code_iso3 TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Pays" PRIMARY KEY (id)
);

CREATE TABLE "Roles" (
    "Id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Roles" PRIMARY KEY ("Id")
);

CREATE TABLE "Statuts" (
    id INTEGER NOT NULL,
    description TEXT NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Statuts" PRIMARY KEY (id)
);

CREATE TABLE "Titulaires" (
    id INTEGER NOT NULL,
    nom TEXT,
    prenom TEXT,
    adresse TEXT,
    telephone TEXT,
    email TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Titulaires" PRIMARY KEY (id)
);

CREATE TABLE "BrevetCabinets" (
    id INTEGER NOT NULL,
    id_brevet INTEGER NOT NULL,
    id_cabinet INTEGER NOT NULL,
    type TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_BrevetCabinets" PRIMARY KEY (id),
    CONSTRAINT "FK_BrevetCabinets_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet) ON DELETE CASCADE,
    CONSTRAINT "FK_BrevetCabinets_Cabinets_id_cabinet" FOREIGN KEY (id_cabinet) REFERENCES "Cabinets" (id) ON DELETE CASCADE
);

CREATE TABLE "BrevetClients" (
    id INTEGER NOT NULL,
    id_brevet INTEGER NOT NULL,
    id_client INTEGER NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_BrevetClients" PRIMARY KEY (id),
    CONSTRAINT "FK_BrevetClients_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet) ON DELETE CASCADE,
    CONSTRAINT "FK_BrevetClients_Clients_id_client" FOREIGN KEY (id_client) REFERENCES "Clients" (id) ON DELETE CASCADE
);

CREATE TABLE "ClientCabinets" (
    "Id" INTEGER NOT NULL,
    "ClientId" INTEGER NOT NULL,
    "CabinetId" INTEGER NOT NULL,
    "Type" TEXT,
    "IsActive" INTEGER NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ClientCabinets" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ClientCabinets_Cabinets_CabinetId" FOREIGN KEY ("CabinetId") REFERENCES "Cabinets" (id) ON DELETE CASCADE,
    CONSTRAINT "FK_ClientCabinets_Clients_ClientId" FOREIGN KEY ("ClientId") REFERENCES "Clients" (id) ON DELETE CASCADE
);

CREATE TABLE "Contacts" (
    id INTEGER NOT NULL,
    nom TEXT,
    prenom TEXT,
    email TEXT,
    telephone TEXT,
    role TEXT,
    id_cabinet INTEGER,
    id_client INTEGER,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    emails_json TEXT NOT NULL,
    phones_json TEXT NOT NULL,
    roles_json TEXT NOT NULL,
    CONSTRAINT "PK_Contacts" PRIMARY KEY (id),
    CONSTRAINT "FK_Contacts_Cabinets_id_cabinet" FOREIGN KEY (id_cabinet) REFERENCES "Cabinets" (id) ON DELETE SET NULL,
    CONSTRAINT "FK_Contacts_Clients_id_client" FOREIGN KEY (id_client) REFERENCES "Clients" (id) ON DELETE SET NULL
);

CREATE TABLE "Users" (
    id INTEGER NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    "canWrite" INTEGER NOT NULL DEFAULT 0,
    "canRead" INTEGER NOT NULL,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "isBlocked" INTEGER NOT NULL,
    nom TEXT,
    prenom TEXT,
    "lastLogin" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "clientId" INTEGER,
    CONSTRAINT "PK_Users" PRIMARY KEY (id),
    CONSTRAINT "FK_Users_Clients_clientId" FOREIGN KEY ("clientId") REFERENCES "Clients" (id) ON DELETE SET NULL
);

CREATE TABLE "BrevetDeposants" (
    id INTEGER NOT NULL,
    id_brevet INTEGER NOT NULL,
    id_deposant INTEGER NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_BrevetDeposants" PRIMARY KEY (id),
    CONSTRAINT "FK_BrevetDeposants_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet) ON DELETE CASCADE,
    CONSTRAINT "FK_BrevetDeposants_Deposants_id_deposant" FOREIGN KEY (id_deposant) REFERENCES "Deposants" (id) ON DELETE CASCADE
);

CREATE TABLE "BrevetInventeurs" (
    id INTEGER NOT NULL,
    id_brevet INTEGER NOT NULL,
    id_inventeur INTEGER NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_BrevetInventeurs" PRIMARY KEY (id),
    CONSTRAINT "FK_BrevetInventeurs_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet) ON DELETE CASCADE,
    CONSTRAINT "FK_BrevetInventeurs_Inventeurs_id_inventeur" FOREIGN KEY (id_inventeur) REFERENCES "Inventeurs" (id) ON DELETE CASCADE
);

CREATE TABLE "DeposantPays" (
    id INTEGER NOT NULL,
    id_deposant INTEGER NOT NULL,
    id_pays INTEGER NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_DeposantPays" PRIMARY KEY (id),
    CONSTRAINT "FK_DeposantPays_Deposants_id_deposant" FOREIGN KEY (id_deposant) REFERENCES "Deposants" (id) ON DELETE CASCADE,
    CONSTRAINT "FK_DeposantPays_Pays_id_pays" FOREIGN KEY (id_pays) REFERENCES "Pays" (id) ON DELETE CASCADE
);

CREATE TABLE "InventeurPays" (
    id INTEGER NOT NULL,
    id_inventeur INTEGER NOT NULL,
    id_pays INTEGER NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_InventeurPays" PRIMARY KEY (id),
    CONSTRAINT "FK_InventeurPays_Inventeurs_id_inventeur" FOREIGN KEY (id_inventeur) REFERENCES "Inventeurs" (id) ON DELETE CASCADE,
    CONSTRAINT "FK_InventeurPays_Pays_id_pays" FOREIGN KEY (id_pays) REFERENCES "Pays" (id) ON DELETE CASCADE
);

CREATE TABLE "NumeroPays" (
    id INTEGER NOT NULL,
    pays_code TEXT NOT NULL,
    numero TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    "PaysId" INTEGER,
    CONSTRAINT "PK_NumeroPays" PRIMARY KEY (id),
    CONSTRAINT "FK_NumeroPays_Pays_PaysId" FOREIGN KEY ("PaysId") REFERENCES "Pays" (id)
);

CREATE TABLE "InformationsDepot" (
    id INTEGER NOT NULL,
    id_brevet INTEGER NOT NULL,
    id_pays INTEGER,
    id_statuts INTEGER,
    numero_depot TEXT,
    numero_publication TEXT,
    numero_delivrance TEXT,
    date_depot timestamp with time zone,
    date_publication timestamp with time zone,
    date_delivrance timestamp with time zone,
    licence INTEGER NOT NULL DEFAULT 0,
    commentaire TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_InformationsDepot" PRIMARY KEY (id),
    CONSTRAINT "FK_InformationsDepot_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet) ON DELETE CASCADE,
    CONSTRAINT "FK_InformationsDepot_Pays_id_pays" FOREIGN KEY (id_pays) REFERENCES "Pays" (id),
    CONSTRAINT "FK_InformationsDepot_Statuts_id_statuts" FOREIGN KEY (id_statuts) REFERENCES "Statuts" (id)
);

CREATE TABLE "BrevetTitulaires" (
    id INTEGER NOT NULL,
    id_brevet INTEGER NOT NULL,
    id_titulaire INTEGER NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_BrevetTitulaires" PRIMARY KEY (id),
    CONSTRAINT "FK_BrevetTitulaires_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet) ON DELETE CASCADE,
    CONSTRAINT "FK_BrevetTitulaires_Titulaires_id_titulaire" FOREIGN KEY (id_titulaire) REFERENCES "Titulaires" (id) ON DELETE CASCADE
);

CREATE TABLE "TitulairePays" (
    id INTEGER NOT NULL,
    id_titulaire INTEGER NOT NULL,
    id_pays INTEGER NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_TitulairePays" PRIMARY KEY (id),
    CONSTRAINT "FK_TitulairePays_Pays_id_pays" FOREIGN KEY (id_pays) REFERENCES "Pays" (id) ON DELETE CASCADE,
    CONSTRAINT "FK_TitulairePays_Titulaires_id_titulaire" FOREIGN KEY (id_titulaire) REFERENCES "Titulaires" (id) ON DELETE CASCADE
);

CREATE TABLE "UserRoles" (
    "Id" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL,
    "RoleId" INTEGER NOT NULL,
    "ClientId" INTEGER,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_UserRoles" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_UserRoles_Clients_ClientId" FOREIGN KEY ("ClientId") REFERENCES "Clients" (id) ON DELETE CASCADE,
    CONSTRAINT "FK_UserRoles_Roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_UserRoles_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" (id) ON DELETE CASCADE
);

CREATE INDEX "IX_BrevetCabinets_id_brevet" ON "BrevetCabinets" (id_brevet);

CREATE INDEX "IX_BrevetCabinets_id_cabinet" ON "BrevetCabinets" (id_cabinet);

CREATE INDEX "IX_BrevetClients_id_client" ON "BrevetClients" (id_client);

CREATE UNIQUE INDEX "IX_BrevetClients_Unique" ON "BrevetClients" (id_brevet, id_client);

CREATE INDEX "IX_BrevetDeposants_id_deposant" ON "BrevetDeposants" (id_deposant);

CREATE UNIQUE INDEX "IX_BrevetDeposants_Unique" ON "BrevetDeposants" (id_brevet, id_deposant);

CREATE INDEX "IX_BrevetInventeurs_id_inventeur" ON "BrevetInventeurs" (id_inventeur);

CREATE UNIQUE INDEX "IX_BrevetInventeurs_Unique" ON "BrevetInventeurs" (id_brevet, id_inventeur);

CREATE INDEX "IX_Brevets_ReferenceFamille" ON "Brevets" (reference_famille);

CREATE INDEX "IX_BrevetTitulaires_id_titulaire" ON "BrevetTitulaires" (id_titulaire);

CREATE UNIQUE INDEX "IX_BrevetTitulaires_Unique" ON "BrevetTitulaires" (id_brevet, id_titulaire);

CREATE INDEX "IX_ClientCabinets_CabinetId" ON "ClientCabinets" ("CabinetId");

CREATE UNIQUE INDEX "IX_ClientCabinets_Unique" ON "ClientCabinets" ("ClientId", "CabinetId");

CREATE INDEX "IX_Clients_NomClient" ON "Clients" (nom_client);

CREATE INDEX "IX_Contacts_id_cabinet" ON "Contacts" (id_cabinet);

CREATE INDEX "IX_Contacts_id_client" ON "Contacts" (id_client);

CREATE INDEX "IX_DeposantPays_id_deposant" ON "DeposantPays" (id_deposant);

CREATE INDEX "IX_DeposantPays_id_pays" ON "DeposantPays" (id_pays);

CREATE INDEX "IX_InformationsDepot_id_brevet" ON "InformationsDepot" (id_brevet);

CREATE INDEX "IX_InformationsDepot_id_pays" ON "InformationsDepot" (id_pays);

CREATE INDEX "IX_InformationsDepot_id_statuts" ON "InformationsDepot" (id_statuts);

CREATE INDEX "IX_InventeurPays_id_inventeur" ON "InventeurPays" (id_inventeur);

CREATE INDEX "IX_InventeurPays_id_pays" ON "InventeurPays" (id_pays);

CREATE INDEX "IX_NumeroPays_PaysId" ON "NumeroPays" ("PaysId");

CREATE UNIQUE INDEX "IX_Roles_Name" ON "Roles" ("Name");

CREATE INDEX "IX_TitulairePays_id_pays" ON "TitulairePays" (id_pays);

CREATE INDEX "IX_TitulairePays_id_titulaire" ON "TitulairePays" (id_titulaire);

CREATE INDEX "IX_UserRoles_ClientId" ON "UserRoles" ("ClientId");

CREATE INDEX "IX_UserRoles_RoleId" ON "UserRoles" ("RoleId");

CREATE UNIQUE INDEX "IX_UserRoles_Unique" ON "UserRoles" ("UserId", "RoleId", "ClientId");

CREATE INDEX "IX_Users_ClientId" ON "Users" ("clientId");

CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" (email);

CREATE UNIQUE INDEX "IX_Users_Username" ON "Users" (username);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250801091452_InitialCreate', '8.0.4');

COMMIT;

START TRANSACTION;

ALTER TABLE "Cabinets" ADD type INTEGER NOT NULL DEFAULT 1;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250804151200_AddCabinetType', '8.0.4');

COMMIT;

START TRANSACTION;

CREATE TABLE "Brevets" (
    id_brevet INTEGER NOT NULL,
    reference_famille TEXT,
    titre TEXT,
    commentaire TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Brevets" PRIMARY KEY (id_brevet)
);

CREATE INDEX "IX_Brevets_ReferenceFamille" ON "Brevets" (reference_famille);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250804162558_RestoreBrevetTable', '8.0.4');

COMMIT;

START TRANSACTION;

CREATE TABLE "InformationDepotCabinets" (
    id INTEGER NOT NULL,
    information_depot_id INTEGER NOT NULL,
    cabinet_id INTEGER NOT NULL,
    category INTEGER NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_InformationDepotCabinets" PRIMARY KEY (id),
    CONSTRAINT "FK_InformationDepotCabinets_Cabinets_cabinet_id" FOREIGN KEY (cabinet_id) REFERENCES "Cabinets" (id) ON DELETE CASCADE,
    CONSTRAINT "FK_InformationDepotCabinets_InformationsDepot_information_depot_id" FOREIGN KEY (information_depot_id) REFERENCES "InformationsDepot" (id) ON DELETE CASCADE
);

CREATE TABLE "InformationDepotCabinetContacts" (
    id INTEGER NOT NULL,
    information_depot_cabinet_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    CONSTRAINT "PK_InformationDepotCabinetContacts" PRIMARY KEY (id),
    CONSTRAINT "FK_InformationDepotCabinetContacts_Contacts_contact_id" FOREIGN KEY (contact_id) REFERENCES "Contacts" (id) ON DELETE CASCADE,
    CONSTRAINT "FK_InformationDepotCabinetContacts_InformationDepotCabinets_information_depot_cabinet_id" FOREIGN KEY (information_depot_cabinet_id) REFERENCES "InformationDepotCabinets" (id) ON DELETE CASCADE
);

CREATE TABLE "InformationDepotCabinetRoles" (
    id INTEGER NOT NULL,
    information_depot_cabinet_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    CONSTRAINT "PK_InformationDepotCabinetRoles" PRIMARY KEY (id),
    CONSTRAINT "FK_InformationDepotCabinetRoles_InformationDepotCabinets_information_depot_cabinet_id" FOREIGN KEY (information_depot_cabinet_id) REFERENCES "InformationDepotCabinets" (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX "IX_InfoDepotCabContact_Unique" ON "InformationDepotCabinetContacts" (information_depot_cabinet_id, contact_id);

CREATE INDEX "IX_InformationDepotCabinetContacts_contact_id" ON "InformationDepotCabinetContacts" (contact_id);

CREATE UNIQUE INDEX "IX_InfoDepotCabRole_Unique" ON "InformationDepotCabinetRoles" (information_depot_cabinet_id, role);

CREATE UNIQUE INDEX "IX_InfoDepotCab_Unique" ON "InformationDepotCabinets" (information_depot_id, cabinet_id, category);

CREATE INDEX "IX_InformationDepotCabinets_cabinet_id" ON "InformationDepotCabinets" (cabinet_id);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250819081400_AddInformationDepotCabinets', '8.0.4');

COMMIT;

START TRANSACTION;

ALTER TABLE "TitulairePays" ADD id_brevet INTEGER;

ALTER TABLE "InventeurPays" ADD id_brevet INTEGER;

ALTER TABLE "DeposantPays" ADD id_brevet INTEGER;

CREATE INDEX "IX_TitulairePays_id_brevet" ON "TitulairePays" (id_brevet);

CREATE INDEX "IX_InventeurPays_id_brevet" ON "InventeurPays" (id_brevet);

CREATE INDEX "IX_DeposantPays_id_brevet" ON "DeposantPays" (id_brevet);

ALTER TABLE "DeposantPays" ADD CONSTRAINT "FK_DeposantPays_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet);

ALTER TABLE "InventeurPays" ADD CONSTRAINT "FK_InventeurPays_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet);

ALTER TABLE "TitulairePays" ADD CONSTRAINT "FK_TitulairePays_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250819145210_AddBrevetIdToActorPaysV2', '8.0.4');

COMMIT;

START TRANSACTION;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250819145259_AdjustActorPaysFkDeleteBehavior', '8.0.4');

COMMIT;

START TRANSACTION;

ALTER TABLE "DeposantPays" DROP CONSTRAINT "FK_DeposantPays_Brevets_id_brevet";

ALTER TABLE "InventeurPays" DROP CONSTRAINT "FK_InventeurPays_Brevets_id_brevet";

ALTER TABLE "TitulairePays" DROP CONSTRAINT "FK_TitulairePays_Brevets_id_brevet";

ALTER TABLE "DeposantPays" ADD CONSTRAINT "FK_DeposantPays_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet) ON DELETE SET NULL;

ALTER TABLE "InventeurPays" ADD CONSTRAINT "FK_InventeurPays_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet) ON DELETE SET NULL;

ALTER TABLE "TitulairePays" ADD CONSTRAINT "FK_TitulairePays_Brevets_id_brevet" FOREIGN KEY (id_brevet) REFERENCES "Brevets" (id_brevet) ON DELETE SET NULL;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250819145402_SetNullOnActorPaysBrevetFk', '8.0.4');

COMMIT;

START TRANSACTION;

ALTER TABLE "BrevetCabinets" DROP CONSTRAINT "FK_BrevetCabinets_Brevets_id_brevet";

ALTER TABLE "BrevetCabinets" DROP CONSTRAINT "FK_BrevetCabinets_Cabinets_id_cabinet";

ALTER TABLE "BrevetClients" DROP CONSTRAINT "FK_BrevetClients_Brevets_id_brevet";

ALTER TABLE "BrevetClients" DROP CONSTRAINT "FK_BrevetClients_Clients_id_client";

ALTER TABLE "BrevetDeposants" DROP CONSTRAINT "FK_BrevetDeposants_Brevets_id_brevet";

ALTER TABLE "BrevetDeposants" DROP CONSTRAINT "FK_BrevetDeposants_Deposants_id_deposant";

ALTER TABLE "BrevetInventeurs" DROP CONSTRAINT "FK_BrevetInventeurs_Brevets_id_brevet";

ALTER TABLE "BrevetInventeurs" DROP CONSTRAINT "FK_BrevetInventeurs_Inventeurs_id_inventeur";

ALTER TABLE "BrevetTitulaires" DROP CONSTRAINT "FK_BrevetTitulaires_Brevets_id_brevet";

ALTER TABLE "BrevetTitulaires" DROP CONSTRAINT "FK_BrevetTitulaires_Titulaires_id_titulaire";

ALTER TABLE "ClientCabinets" DROP CONSTRAINT "FK_ClientCabinets_Cabinets_CabinetId";

ALTER TABLE "ClientCabinets" DROP CONSTRAINT "FK_ClientCabinets_Clients_ClientId";

ALTER TABLE "Contacts" DROP CONSTRAINT "FK_Contacts_Cabinets_id_cabinet";

ALTER TABLE "Contacts" DROP CONSTRAINT "FK_Contacts_Clients_id_client";

ALTER TABLE "DeposantPays" DROP CONSTRAINT "FK_DeposantPays_Brevets_id_brevet";

ALTER TABLE "DeposantPays" DROP CONSTRAINT "FK_DeposantPays_Deposants_id_deposant";

ALTER TABLE "DeposantPays" DROP CONSTRAINT "FK_DeposantPays_Pays_id_pays";

ALTER TABLE "InformationDepotCabinetContacts" DROP CONSTRAINT "FK_InformationDepotCabinetContacts_Contacts_contact_id";

ALTER TABLE "InformationDepotCabinetContacts" DROP CONSTRAINT "FK_InformationDepotCabinetContacts_InformationDepotCabinets_information_depot_cabinet_id";

ALTER TABLE "InformationDepotCabinetRoles" DROP CONSTRAINT "FK_InformationDepotCabinetRoles_InformationDepotCabinets_information_depot_cabinet_id";

ALTER TABLE "InformationDepotCabinets" DROP CONSTRAINT "FK_InformationDepotCabinets_Cabinets_cabinet_id";

ALTER TABLE "InformationDepotCabinets" DROP CONSTRAINT "FK_InformationDepotCabinets_InformationsDepot_information_depot_id";

ALTER TABLE "InformationsDepot" DROP CONSTRAINT "FK_InformationsDepot_Brevets_id_brevet";

ALTER TABLE "InformationsDepot" DROP CONSTRAINT "FK_InformationsDepot_Pays_id_pays";

ALTER TABLE "InformationsDepot" DROP CONSTRAINT "FK_InformationsDepot_Statuts_id_statuts";

ALTER TABLE "InventeurPays" DROP CONSTRAINT "FK_InventeurPays_Brevets_id_brevet";

ALTER TABLE "InventeurPays" DROP CONSTRAINT "FK_InventeurPays_Inventeurs_id_inventeur";

ALTER TABLE "InventeurPays" DROP CONSTRAINT "FK_InventeurPays_Pays_id_pays";

ALTER TABLE "NumeroPays" DROP CONSTRAINT "FK_NumeroPays_Pays_PaysId";

ALTER TABLE "TitulairePays" DROP CONSTRAINT "FK_TitulairePays_Brevets_id_brevet";

ALTER TABLE "TitulairePays" DROP CONSTRAINT "FK_TitulairePays_Pays_id_pays";

ALTER TABLE "TitulairePays" DROP CONSTRAINT "FK_TitulairePays_Titulaires_id_titulaire";

ALTER TABLE "UserRoles" DROP CONSTRAINT "FK_UserRoles_Clients_ClientId";

ALTER TABLE "UserRoles" DROP CONSTRAINT "FK_UserRoles_Roles_RoleId";

ALTER TABLE "UserRoles" DROP CONSTRAINT "FK_UserRoles_Users_UserId";

ALTER TABLE "Users" DROP CONSTRAINT "FK_Users_Clients_clientId";

ALTER TABLE "Users" DROP CONSTRAINT "PK_Users";

ALTER TABLE "UserRoles" DROP CONSTRAINT "PK_UserRoles";

ALTER TABLE "Titulaires" DROP CONSTRAINT "PK_Titulaires";

ALTER TABLE "TitulairePays" DROP CONSTRAINT "PK_TitulairePays";

ALTER TABLE "Statuts" DROP CONSTRAINT "PK_Statuts";

ALTER TABLE "Roles" DROP CONSTRAINT "PK_Roles";

ALTER TABLE "Pays" DROP CONSTRAINT "PK_Pays";

ALTER TABLE "NumeroPays" DROP CONSTRAINT "PK_NumeroPays";

ALTER TABLE "Logs" DROP CONSTRAINT "PK_Logs";

ALTER TABLE "Inventeurs" DROP CONSTRAINT "PK_Inventeurs";

ALTER TABLE "InventeurPays" DROP CONSTRAINT "PK_InventeurPays";

ALTER TABLE "InformationsDepot" DROP CONSTRAINT "PK_InformationsDepot";

ALTER TABLE "InformationDepotCabinets" DROP CONSTRAINT "PK_InformationDepotCabinets";

ALTER TABLE "InformationDepotCabinetRoles" DROP CONSTRAINT "PK_InformationDepotCabinetRoles";

ALTER TABLE "InformationDepotCabinetContacts" DROP CONSTRAINT "PK_InformationDepotCabinetContacts";

ALTER TABLE "Deposants" DROP CONSTRAINT "PK_Deposants";

ALTER TABLE "DeposantPays" DROP CONSTRAINT "PK_DeposantPays";

ALTER TABLE "Contacts" DROP CONSTRAINT "PK_Contacts";

ALTER TABLE "Clients" DROP CONSTRAINT "PK_Clients";

ALTER TABLE "ClientCabinets" DROP CONSTRAINT "PK_ClientCabinets";

ALTER TABLE "Cabinets" DROP CONSTRAINT "PK_Cabinets";

ALTER TABLE "BrevetTitulaires" DROP CONSTRAINT "PK_BrevetTitulaires";

ALTER TABLE "Brevets" DROP CONSTRAINT "PK_Brevets";

ALTER TABLE "BrevetInventeurs" DROP CONSTRAINT "PK_BrevetInventeurs";

ALTER TABLE "BrevetDeposants" DROP CONSTRAINT "PK_BrevetDeposants";

ALTER TABLE "BrevetClients" DROP CONSTRAINT "PK_BrevetClients";

ALTER TABLE "BrevetCabinets" DROP CONSTRAINT "PK_BrevetCabinets";

ALTER TABLE "Users" RENAME TO users;

ALTER TABLE "UserRoles" RENAME TO userroles;

ALTER TABLE "Titulaires" RENAME TO titulaires;

ALTER TABLE "TitulairePays" RENAME TO titulairepays;

ALTER TABLE "Statuts" RENAME TO statuts;

ALTER TABLE "Roles" RENAME TO roles;

ALTER TABLE "Pays" RENAME TO pays;

ALTER TABLE "NumeroPays" RENAME TO numeropays;

ALTER TABLE "Logs" RENAME TO logs;

ALTER TABLE "Inventeurs" RENAME TO inventeurs;

ALTER TABLE "InventeurPays" RENAME TO inventeurpays;

ALTER TABLE "InformationsDepot" RENAME TO informationsdepot;

ALTER TABLE "InformationDepotCabinets" RENAME TO informationdepotcabinets;

ALTER TABLE "InformationDepotCabinetRoles" RENAME TO informationdepotcabinetroles;

ALTER TABLE "InformationDepotCabinetContacts" RENAME TO informationdepotcabinetcontacts;

ALTER TABLE "Deposants" RENAME TO deposants;

ALTER TABLE "DeposantPays" RENAME TO deposantpays;

ALTER TABLE "Contacts" RENAME TO contacts;

ALTER TABLE "Clients" RENAME TO clients;

ALTER TABLE "ClientCabinets" RENAME TO clientcabinets;

ALTER TABLE "Cabinets" RENAME TO cabinets;

ALTER TABLE "BrevetTitulaires" RENAME TO brevettitulaires;

ALTER TABLE "Brevets" RENAME TO brevets;

ALTER TABLE "BrevetInventeurs" RENAME TO brevetinventeurs;

ALTER TABLE "BrevetDeposants" RENAME TO brevetdeposants;

ALTER TABLE "BrevetClients" RENAME TO brevetclients;

ALTER TABLE "BrevetCabinets" RENAME TO brevetcabinets;

ALTER TABLE users RENAME COLUMN "updatedAt" TO updatedat;

ALTER TABLE users RENAME COLUMN "lastLogin" TO lastlogin;

ALTER TABLE users RENAME COLUMN "isBlocked" TO isblocked;

ALTER TABLE users RENAME COLUMN "isActive" TO isactive;

ALTER TABLE users RENAME COLUMN "createdAt" TO createdat;

ALTER TABLE users RENAME COLUMN "clientId" TO clientid;

ALTER TABLE users RENAME COLUMN "canWrite" TO canwrite;

ALTER TABLE users RENAME COLUMN "canRead" TO canread;

ALTER TABLE userroles RENAME COLUMN "UserId" TO userid;

ALTER TABLE userroles RENAME COLUMN "UpdatedAt" TO updatedat;

ALTER TABLE userroles RENAME COLUMN "RoleId" TO roleid;

ALTER TABLE userroles RENAME COLUMN "CreatedAt" TO createdat;

ALTER TABLE userroles RENAME COLUMN "ClientId" TO clientid;

ALTER TABLE userroles RENAME COLUMN "Id" TO id;

ALTER INDEX "IX_UserRoles_RoleId" RENAME TO ix_userroles_roleid;

ALTER INDEX "IX_UserRoles_ClientId" RENAME TO ix_userroles_clientid;

ALTER TABLE titulaires RENAME COLUMN "updatedAt" TO updatedat;

ALTER TABLE titulaires RENAME COLUMN "createdAt" TO createdat;

ALTER TABLE titulairepays RENAME COLUMN "createdAt" TO createdat;

ALTER INDEX "IX_TitulairePays_id_titulaire" RENAME TO ix_titulairepays_id_titulaire;

ALTER INDEX "IX_TitulairePays_id_pays" RENAME TO ix_titulairepays_id_pays;

ALTER INDEX "IX_TitulairePays_id_brevet" RENAME TO ix_titulairepays_id_brevet;

ALTER TABLE statuts RENAME COLUMN "updatedAt" TO updatedat;

ALTER TABLE statuts RENAME COLUMN "createdAt" TO createdat;

ALTER TABLE roles RENAME COLUMN "UpdatedAt" TO updatedat;

ALTER TABLE roles RENAME COLUMN "Name" TO name;

ALTER TABLE roles RENAME COLUMN "Description" TO description;

ALTER TABLE roles RENAME COLUMN "CreatedAt" TO createdat;

ALTER TABLE roles RENAME COLUMN "Id" TO id;

ALTER TABLE pays RENAME COLUMN "updatedAt" TO updatedat;

ALTER TABLE pays RENAME COLUMN "createdAt" TO createdat;

ALTER TABLE numeropays RENAME COLUMN "PaysId" TO paysid;

ALTER INDEX "IX_NumeroPays_PaysId" RENAME TO ix_numeropays_paysid;

ALTER TABLE logs RENAME COLUMN "userId" TO userid;

ALTER TABLE inventeurs RENAME COLUMN "updatedAt" TO updatedat;

ALTER TABLE inventeurs RENAME COLUMN "createdAt" TO createdat;

ALTER TABLE inventeurpays RENAME COLUMN "createdAt" TO createdat;

ALTER INDEX "IX_InventeurPays_id_pays" RENAME TO ix_inventeurpays_id_pays;

ALTER INDEX "IX_InventeurPays_id_inventeur" RENAME TO ix_inventeurpays_id_inventeur;

ALTER INDEX "IX_InventeurPays_id_brevet" RENAME TO ix_inventeurpays_id_brevet;

ALTER TABLE informationsdepot RENAME COLUMN "updatedAt" TO updatedat;

ALTER TABLE informationsdepot RENAME COLUMN "createdAt" TO createdat;

ALTER INDEX "IX_InformationsDepot_id_statuts" RENAME TO ix_informationsdepot_id_statuts;

ALTER INDEX "IX_InformationsDepot_id_pays" RENAME TO ix_informationsdepot_id_pays;

ALTER INDEX "IX_InformationsDepot_id_brevet" RENAME TO ix_informationsdepot_id_brevet;

ALTER TABLE informationdepotcabinets RENAME COLUMN "createdAt" TO createdat;

ALTER INDEX "IX_InformationDepotCabinets_cabinet_id" RENAME TO ix_informationdepotcabinets_cabinet_id;

ALTER INDEX "IX_InformationDepotCabinetContacts_contact_id" RENAME TO ix_informationdepotcabinetcontacts_contact_id;

ALTER TABLE deposants RENAME COLUMN "updatedAt" TO updatedat;

ALTER TABLE deposants RENAME COLUMN "createdAt" TO createdat;

ALTER TABLE deposantpays RENAME COLUMN "createdAt" TO createdat;

ALTER INDEX "IX_DeposantPays_id_pays" RENAME TO ix_deposantpays_id_pays;

ALTER INDEX "IX_DeposantPays_id_deposant" RENAME TO ix_deposantpays_id_deposant;

ALTER INDEX "IX_DeposantPays_id_brevet" RENAME TO ix_deposantpays_id_brevet;

ALTER TABLE contacts RENAME COLUMN "updatedAt" TO updatedat;

ALTER TABLE contacts RENAME COLUMN "createdAt" TO createdat;

ALTER INDEX "IX_Contacts_id_client" RENAME TO ix_contacts_id_client;

ALTER INDEX "IX_Contacts_id_cabinet" RENAME TO ix_contacts_id_cabinet;

ALTER TABLE clients RENAME COLUMN "updatedAt" TO updatedat;

ALTER TABLE clients RENAME COLUMN "createdAt" TO createdat;

ALTER TABLE clientcabinets RENAME COLUMN "UpdatedAt" TO updatedat;

ALTER TABLE clientcabinets RENAME COLUMN "Type" TO type;

ALTER TABLE clientcabinets RENAME COLUMN "IsActive" TO isactive;

ALTER TABLE clientcabinets RENAME COLUMN "CreatedAt" TO createdat;

ALTER TABLE clientcabinets RENAME COLUMN "ClientId" TO clientid;

ALTER TABLE clientcabinets RENAME COLUMN "CabinetId" TO cabinetid;

ALTER TABLE clientcabinets RENAME COLUMN "Id" TO id;

ALTER INDEX "IX_ClientCabinets_CabinetId" RENAME TO ix_clientcabinets_cabinetid;

ALTER TABLE cabinets RENAME COLUMN "updatedAt" TO updatedat;

ALTER TABLE cabinets RENAME COLUMN "createdAt" TO createdat;

ALTER TABLE brevettitulaires RENAME COLUMN "createdAt" TO createdat;

ALTER INDEX "IX_BrevetTitulaires_id_titulaire" RENAME TO ix_brevettitulaires_id_titulaire;

ALTER TABLE brevets RENAME COLUMN "updatedAt" TO updatedat;

ALTER TABLE brevets RENAME COLUMN "createdAt" TO createdat;

ALTER TABLE brevetinventeurs RENAME COLUMN "createdAt" TO createdat;

ALTER INDEX "IX_BrevetInventeurs_id_inventeur" RENAME TO ix_brevetinventeurs_id_inventeur;

ALTER TABLE brevetdeposants RENAME COLUMN "createdAt" TO createdat;

ALTER INDEX "IX_BrevetDeposants_id_deposant" RENAME TO ix_brevetdeposants_id_deposant;

ALTER TABLE brevetclients RENAME COLUMN "createdAt" TO createdat;

ALTER INDEX "IX_BrevetClients_id_client" RENAME TO ix_brevetclients_id_client;

ALTER TABLE brevetcabinets RENAME COLUMN "createdAt" TO createdat;

ALTER INDEX "IX_BrevetCabinets_id_cabinet" RENAME TO ix_brevetcabinets_id_cabinet;

ALTER INDEX "IX_BrevetCabinets_id_brevet" RENAME TO ix_brevetcabinets_id_brevet;

ALTER TABLE users ALTER COLUMN username TYPE character varying(100);

ALTER TABLE users ALTER COLUMN updatedat TYPE text;

ALTER TABLE users ALTER COLUMN role TYPE character varying(50);

ALTER TABLE users ALTER COLUMN prenom TYPE character varying(100);

ALTER TABLE users ALTER COLUMN password TYPE text;

ALTER TABLE users ALTER COLUMN nom TYPE character varying(100);

ALTER TABLE users ALTER COLUMN lastlogin TYPE text;

ALTER TABLE users ALTER COLUMN isblocked TYPE integer;

ALTER TABLE users ALTER COLUMN isactive TYPE integer;

ALTER TABLE users ALTER COLUMN email TYPE character varying(100);

ALTER TABLE users ALTER COLUMN createdat TYPE text;

ALTER TABLE users ALTER COLUMN clientid TYPE integer;

ALTER TABLE users ALTER COLUMN canwrite TYPE integer;

ALTER TABLE users ALTER COLUMN canread TYPE integer;

ALTER TABLE users ALTER COLUMN id TYPE integer;
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE userroles ALTER COLUMN userid TYPE integer;

ALTER TABLE userroles ALTER COLUMN updatedat TYPE text;

ALTER TABLE userroles ALTER COLUMN roleid TYPE integer;

ALTER TABLE userroles ALTER COLUMN createdat TYPE text;

ALTER TABLE userroles ALTER COLUMN clientid TYPE integer;

ALTER TABLE userroles ALTER COLUMN id TYPE integer;
ALTER TABLE userroles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE userroles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE titulaires ALTER COLUMN updatedat TYPE text;

ALTER TABLE titulaires ALTER COLUMN telephone TYPE character varying(50);

ALTER TABLE titulaires ALTER COLUMN prenom TYPE character varying(100);

ALTER TABLE titulaires ALTER COLUMN nom TYPE character varying(100);

ALTER TABLE titulaires ALTER COLUMN email TYPE character varying(100);

ALTER TABLE titulaires ALTER COLUMN createdat TYPE text;

ALTER TABLE titulaires ALTER COLUMN adresse TYPE character varying(255);

ALTER TABLE titulaires ALTER COLUMN id TYPE integer;
ALTER TABLE titulaires ALTER COLUMN id DROP DEFAULT;
ALTER TABLE titulaires ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE titulairepays ALTER COLUMN id_titulaire TYPE integer;

ALTER TABLE titulairepays ALTER COLUMN id_pays TYPE integer;

ALTER TABLE titulairepays ALTER COLUMN id_brevet TYPE integer;

ALTER TABLE titulairepays ALTER COLUMN createdat TYPE text;

ALTER TABLE titulairepays ALTER COLUMN id TYPE integer;
ALTER TABLE titulairepays ALTER COLUMN id DROP DEFAULT;
ALTER TABLE titulairepays ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE statuts ALTER COLUMN updatedat TYPE text;

ALTER TABLE statuts ALTER COLUMN description TYPE character varying(100);

ALTER TABLE statuts ALTER COLUMN createdat TYPE text;

ALTER TABLE statuts ALTER COLUMN id TYPE integer;
ALTER TABLE statuts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE statuts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE roles ALTER COLUMN updatedat TYPE text;

ALTER TABLE roles ALTER COLUMN name TYPE character varying(100);

ALTER TABLE roles ALTER COLUMN description TYPE character varying(255);

ALTER TABLE roles ALTER COLUMN createdat TYPE text;

ALTER TABLE roles ALTER COLUMN id TYPE integer;
ALTER TABLE roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE pays ALTER COLUMN updatedat TYPE text;

ALTER TABLE pays ALTER COLUMN nom_fr_fr TYPE character varying(100);

ALTER TABLE pays ALTER COLUMN createdat TYPE text;

ALTER TABLE pays ALTER COLUMN code_iso3 TYPE character varying(10);

ALTER TABLE pays ALTER COLUMN code_iso TYPE character varying(10);

ALTER TABLE pays ALTER COLUMN id TYPE integer;
ALTER TABLE pays ALTER COLUMN id DROP DEFAULT;
ALTER TABLE pays ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE numeropays ALTER COLUMN updated_at TYPE text;

ALTER TABLE numeropays ALTER COLUMN pays_code TYPE character varying(10);

ALTER TABLE numeropays ALTER COLUMN numero TYPE character varying(50);

ALTER TABLE numeropays ALTER COLUMN is_active TYPE integer;

ALTER TABLE numeropays ALTER COLUMN description TYPE character varying(100);

ALTER TABLE numeropays ALTER COLUMN created_at TYPE text;

ALTER TABLE numeropays ALTER COLUMN paysid TYPE integer;

ALTER TABLE numeropays ALTER COLUMN id TYPE integer;
ALTER TABLE numeropays ALTER COLUMN id DROP DEFAULT;
ALTER TABLE numeropays ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE logs ALTER COLUMN user_agent TYPE character varying(500);

ALTER TABLE logs ALTER COLUMN userid TYPE character varying(100);

ALTER TABLE logs ALTER COLUMN timestamp TYPE text;

ALTER TABLE logs ALTER COLUMN table_name TYPE character varying(100);

ALTER TABLE logs ALTER COLUMN record_id TYPE integer;

ALTER TABLE logs ALTER COLUMN old_values TYPE text;

ALTER TABLE logs ALTER COLUMN new_values TYPE text;

ALTER TABLE logs ALTER COLUMN message TYPE text;

ALTER TABLE logs ALTER COLUMN level TYPE character varying(50);

ALTER TABLE logs ALTER COLUMN ip_address TYPE character varying(45);

ALTER TABLE logs ALTER COLUMN details TYPE text;

ALTER TABLE logs ALTER COLUMN created_at TYPE text;

ALTER TABLE logs ALTER COLUMN action TYPE character varying(100);

ALTER TABLE logs ALTER COLUMN id TYPE integer;
ALTER TABLE logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE logs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE inventeurs ALTER COLUMN updatedat TYPE text;

ALTER TABLE inventeurs ALTER COLUMN telephone TYPE character varying(50);

ALTER TABLE inventeurs ALTER COLUMN prenom TYPE character varying(100);

ALTER TABLE inventeurs ALTER COLUMN nom TYPE character varying(100);

ALTER TABLE inventeurs ALTER COLUMN email TYPE character varying(100);

ALTER TABLE inventeurs ALTER COLUMN createdat TYPE text;

ALTER TABLE inventeurs ALTER COLUMN adresse TYPE character varying(255);

ALTER TABLE inventeurs ALTER COLUMN id TYPE integer;
ALTER TABLE inventeurs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE inventeurs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE inventeurpays ALTER COLUMN id_pays TYPE integer;

ALTER TABLE inventeurpays ALTER COLUMN id_inventeur TYPE integer;

ALTER TABLE inventeurpays ALTER COLUMN id_brevet TYPE integer;

ALTER TABLE inventeurpays ALTER COLUMN createdat TYPE text;

ALTER TABLE inventeurpays ALTER COLUMN id TYPE integer;
ALTER TABLE inventeurpays ALTER COLUMN id DROP DEFAULT;
ALTER TABLE inventeurpays ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE informationsdepot ALTER COLUMN updatedat TYPE text;

ALTER TABLE informationsdepot ALTER COLUMN numero_publication TYPE character varying(100);

ALTER TABLE informationsdepot ALTER COLUMN numero_depot TYPE character varying(100);

ALTER TABLE informationsdepot ALTER COLUMN numero_delivrance TYPE character varying(100);

ALTER TABLE informationsdepot ALTER COLUMN licence TYPE integer;

ALTER TABLE informationsdepot ALTER COLUMN id_statuts TYPE integer;

ALTER TABLE informationsdepot ALTER COLUMN id_pays TYPE integer;

ALTER TABLE informationsdepot ALTER COLUMN id_brevet TYPE integer;

ALTER TABLE informationsdepot ALTER COLUMN date_publication TYPE text;

ALTER TABLE informationsdepot ALTER COLUMN date_depot TYPE text;

ALTER TABLE informationsdepot ALTER COLUMN date_delivrance TYPE text;

ALTER TABLE informationsdepot ALTER COLUMN createdat TYPE text;

ALTER TABLE informationsdepot ALTER COLUMN commentaire TYPE character varying(500);

ALTER TABLE informationsdepot ALTER COLUMN id TYPE integer;
ALTER TABLE informationsdepot ALTER COLUMN id DROP DEFAULT;
ALTER TABLE informationsdepot ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE informationdepotcabinets ALTER COLUMN information_depot_id TYPE integer;

ALTER TABLE informationdepotcabinets ALTER COLUMN createdat TYPE text;

ALTER TABLE informationdepotcabinets ALTER COLUMN category TYPE integer;

ALTER TABLE informationdepotcabinets ALTER COLUMN cabinet_id TYPE integer;

ALTER TABLE informationdepotcabinets ALTER COLUMN id TYPE integer;
ALTER TABLE informationdepotcabinets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE informationdepotcabinets ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE informationdepotcabinetroles ALTER COLUMN role TYPE character varying(50);

ALTER TABLE informationdepotcabinetroles ALTER COLUMN information_depot_cabinet_id TYPE integer;

ALTER TABLE informationdepotcabinetroles ALTER COLUMN id TYPE integer;
ALTER TABLE informationdepotcabinetroles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE informationdepotcabinetroles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE informationdepotcabinetcontacts ALTER COLUMN information_depot_cabinet_id TYPE integer;

ALTER TABLE informationdepotcabinetcontacts ALTER COLUMN contact_id TYPE integer;

ALTER TABLE informationdepotcabinetcontacts ALTER COLUMN id TYPE integer;
ALTER TABLE informationdepotcabinetcontacts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE informationdepotcabinetcontacts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE deposants ALTER COLUMN updatedat TYPE text;

ALTER TABLE deposants ALTER COLUMN telephone TYPE character varying(50);

ALTER TABLE deposants ALTER COLUMN prenom TYPE character varying(100);

ALTER TABLE deposants ALTER COLUMN nom TYPE character varying(100);

ALTER TABLE deposants ALTER COLUMN email TYPE character varying(100);

ALTER TABLE deposants ALTER COLUMN createdat TYPE text;

ALTER TABLE deposants ALTER COLUMN adresse TYPE character varying(255);

ALTER TABLE deposants ALTER COLUMN id TYPE integer;
ALTER TABLE deposants ALTER COLUMN id DROP DEFAULT;
ALTER TABLE deposants ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE deposantpays ALTER COLUMN id_pays TYPE integer;

ALTER TABLE deposantpays ALTER COLUMN id_deposant TYPE integer;

ALTER TABLE deposantpays ALTER COLUMN id_brevet TYPE integer;

ALTER TABLE deposantpays ALTER COLUMN createdat TYPE text;

ALTER TABLE deposantpays ALTER COLUMN id TYPE integer;
ALTER TABLE deposantpays ALTER COLUMN id DROP DEFAULT;
ALTER TABLE deposantpays ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE contacts ALTER COLUMN updatedat TYPE text;

ALTER TABLE contacts ALTER COLUMN telephone TYPE character varying(50);

ALTER TABLE contacts ALTER COLUMN role TYPE character varying(100);

ALTER TABLE contacts ALTER COLUMN prenom TYPE character varying(100);

ALTER TABLE contacts ALTER COLUMN nom TYPE character varying(100);

ALTER TABLE contacts ALTER COLUMN id_client TYPE integer;

ALTER TABLE contacts ALTER COLUMN id_cabinet TYPE integer;

ALTER TABLE contacts ALTER COLUMN email TYPE character varying(100);

ALTER TABLE contacts ALTER COLUMN createdat TYPE text;

ALTER TABLE contacts ALTER COLUMN id TYPE integer;
ALTER TABLE contacts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE contacts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE clients ALTER COLUMN updatedat TYPE text;

ALTER TABLE clients ALTER COLUMN telephone_client TYPE character varying(50);

ALTER TABLE clients ALTER COLUMN reference_client TYPE character varying(255);

ALTER TABLE clients ALTER COLUMN pays_client TYPE character varying(100);

ALTER TABLE clients ALTER COLUMN nom_client TYPE character varying(255);

ALTER TABLE clients ALTER COLUMN is_blocked TYPE integer;

ALTER TABLE clients ALTER COLUMN email_client TYPE character varying(255);

ALTER TABLE clients ALTER COLUMN createdat TYPE text;

ALTER TABLE clients ALTER COLUMN code_postal TYPE character varying(20);

ALTER TABLE clients ALTER COLUMN can_write TYPE integer;

ALTER TABLE clients ALTER COLUMN can_read TYPE integer;

ALTER TABLE clients ALTER COLUMN adresse_client TYPE character varying(500);

ALTER TABLE clients ALTER COLUMN id TYPE integer;
ALTER TABLE clients ALTER COLUMN id DROP DEFAULT;
ALTER TABLE clients ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE clientcabinets ALTER COLUMN updatedat TYPE text;

ALTER TABLE clientcabinets ALTER COLUMN type TYPE character varying(100);

ALTER TABLE clientcabinets ALTER COLUMN isactive TYPE integer;

ALTER TABLE clientcabinets ALTER COLUMN createdat TYPE text;

ALTER TABLE clientcabinets ALTER COLUMN clientid TYPE integer;

ALTER TABLE clientcabinets ALTER COLUMN cabinetid TYPE integer;

ALTER TABLE clientcabinets ALTER COLUMN id TYPE integer;
ALTER TABLE clientcabinets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE clientcabinets ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE cabinets ALTER COLUMN updatedat TYPE text;

ALTER TABLE cabinets ALTER COLUMN type TYPE integer;

ALTER TABLE cabinets ALTER COLUMN telephone_cabinet TYPE character varying(50);

ALTER TABLE cabinets ALTER COLUMN pays_cabinet TYPE character varying(100);

ALTER TABLE cabinets ALTER COLUMN nom_cabinet TYPE character varying(255);

ALTER TABLE cabinets ALTER COLUMN email_cabinet TYPE character varying(100);

ALTER TABLE cabinets ALTER COLUMN createdat TYPE text;

ALTER TABLE cabinets ALTER COLUMN code_postal TYPE character varying(50);

ALTER TABLE cabinets ALTER COLUMN adresse_cabinet TYPE character varying(255);

ALTER TABLE cabinets ALTER COLUMN id TYPE integer;
ALTER TABLE cabinets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE cabinets ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE brevettitulaires ALTER COLUMN id_titulaire TYPE integer;

ALTER TABLE brevettitulaires ALTER COLUMN id_brevet TYPE integer;

ALTER TABLE brevettitulaires ALTER COLUMN createdat TYPE text;

ALTER TABLE brevettitulaires ALTER COLUMN id TYPE integer;
ALTER TABLE brevettitulaires ALTER COLUMN id DROP DEFAULT;
ALTER TABLE brevettitulaires ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE brevets ALTER COLUMN updatedat TYPE text;

ALTER TABLE brevets ALTER COLUMN titre TYPE character varying(500);

ALTER TABLE brevets ALTER COLUMN reference_famille TYPE character varying(255);

ALTER TABLE brevets ALTER COLUMN createdat TYPE text;

ALTER TABLE brevets ALTER COLUMN commentaire TYPE text;

ALTER TABLE brevets ALTER COLUMN id_brevet TYPE integer;
ALTER TABLE brevets ALTER COLUMN id_brevet DROP DEFAULT;
ALTER TABLE brevets ALTER COLUMN id_brevet ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE brevetinventeurs ALTER COLUMN id_inventeur TYPE integer;

ALTER TABLE brevetinventeurs ALTER COLUMN id_brevet TYPE integer;

ALTER TABLE brevetinventeurs ALTER COLUMN createdat TYPE text;

ALTER TABLE brevetinventeurs ALTER COLUMN id TYPE integer;
ALTER TABLE brevetinventeurs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE brevetinventeurs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE brevetdeposants ALTER COLUMN id_deposant TYPE integer;

ALTER TABLE brevetdeposants ALTER COLUMN id_brevet TYPE integer;

ALTER TABLE brevetdeposants ALTER COLUMN createdat TYPE text;

ALTER TABLE brevetdeposants ALTER COLUMN id TYPE integer;
ALTER TABLE brevetdeposants ALTER COLUMN id DROP DEFAULT;
ALTER TABLE brevetdeposants ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE brevetclients ALTER COLUMN id_client TYPE integer;

ALTER TABLE brevetclients ALTER COLUMN id_brevet TYPE integer;

ALTER TABLE brevetclients ALTER COLUMN createdat TYPE text;

ALTER TABLE brevetclients ALTER COLUMN id TYPE integer;
ALTER TABLE brevetclients ALTER COLUMN id DROP DEFAULT;
ALTER TABLE brevetclients ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE brevetcabinets ALTER COLUMN id_cabinet TYPE integer;

ALTER TABLE brevetcabinets ALTER COLUMN id_brevet TYPE integer;

ALTER TABLE brevetcabinets ALTER COLUMN createdat TYPE text;

ALTER TABLE brevetcabinets ALTER COLUMN id TYPE integer;
ALTER TABLE brevetcabinets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE brevetcabinets ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE users ADD CONSTRAINT pk_users PRIMARY KEY (id);

ALTER TABLE userroles ADD CONSTRAINT pk_userroles PRIMARY KEY (id);

ALTER TABLE titulaires ADD CONSTRAINT pk_titulaires PRIMARY KEY (id);

ALTER TABLE titulairepays ADD CONSTRAINT pk_titulairepays PRIMARY KEY (id);

ALTER TABLE statuts ADD CONSTRAINT pk_statuts PRIMARY KEY (id);

ALTER TABLE roles ADD CONSTRAINT pk_roles PRIMARY KEY (id);

ALTER TABLE pays ADD CONSTRAINT pk_pays PRIMARY KEY (id);

ALTER TABLE numeropays ADD CONSTRAINT pk_numeropays PRIMARY KEY (id);

ALTER TABLE logs ADD CONSTRAINT pk_logs PRIMARY KEY (id);

ALTER TABLE inventeurs ADD CONSTRAINT pk_inventeurs PRIMARY KEY (id);

ALTER TABLE inventeurpays ADD CONSTRAINT pk_inventeurpays PRIMARY KEY (id);

ALTER TABLE informationsdepot ADD CONSTRAINT pk_informationsdepot PRIMARY KEY (id);

ALTER TABLE informationdepotcabinets ADD CONSTRAINT pk_informationdepotcabinets PRIMARY KEY (id);

ALTER TABLE informationdepotcabinetroles ADD CONSTRAINT pk_informationdepotcabinetroles PRIMARY KEY (id);

ALTER TABLE informationdepotcabinetcontacts ADD CONSTRAINT pk_informationdepotcabinetcontacts PRIMARY KEY (id);

ALTER TABLE deposants ADD CONSTRAINT pk_deposants PRIMARY KEY (id);

ALTER TABLE deposantpays ADD CONSTRAINT pk_deposantpays PRIMARY KEY (id);

ALTER TABLE contacts ADD CONSTRAINT pk_contacts PRIMARY KEY (id);

ALTER TABLE clients ADD CONSTRAINT pk_clients PRIMARY KEY (id);

ALTER TABLE clientcabinets ADD CONSTRAINT pk_clientcabinets PRIMARY KEY (id);

ALTER TABLE cabinets ADD CONSTRAINT pk_cabinets PRIMARY KEY (id);

ALTER TABLE brevettitulaires ADD CONSTRAINT pk_brevettitulaires PRIMARY KEY (id);

ALTER TABLE brevets ADD CONSTRAINT pk_brevets PRIMARY KEY (id_brevet);

ALTER TABLE brevetinventeurs ADD CONSTRAINT pk_brevetinventeurs PRIMARY KEY (id);

ALTER TABLE brevetdeposants ADD CONSTRAINT pk_brevetdeposants PRIMARY KEY (id);

ALTER TABLE brevetclients ADD CONSTRAINT pk_brevetclients PRIMARY KEY (id);

ALTER TABLE brevetcabinets ADD CONSTRAINT pk_brevetcabinets PRIMARY KEY (id);

ALTER TABLE brevetcabinets ADD CONSTRAINT fk_brevetcabinets_brevets_id_brevet FOREIGN KEY (id_brevet) REFERENCES brevets (id_brevet) ON DELETE CASCADE;

ALTER TABLE brevetcabinets ADD CONSTRAINT fk_brevetcabinets_cabinets_id_cabinet FOREIGN KEY (id_cabinet) REFERENCES cabinets (id) ON DELETE CASCADE;

ALTER TABLE brevetclients ADD CONSTRAINT fk_brevetclients_brevets_id_brevet FOREIGN KEY (id_brevet) REFERENCES brevets (id_brevet) ON DELETE CASCADE;

ALTER TABLE brevetclients ADD CONSTRAINT fk_brevetclients_clients_id_client FOREIGN KEY (id_client) REFERENCES clients (id) ON DELETE CASCADE;

ALTER TABLE brevetdeposants ADD CONSTRAINT fk_brevetdeposants_brevets_id_brevet FOREIGN KEY (id_brevet) REFERENCES brevets (id_brevet) ON DELETE CASCADE;

ALTER TABLE brevetdeposants ADD CONSTRAINT fk_brevetdeposants_deposants_id_deposant FOREIGN KEY (id_deposant) REFERENCES deposants (id) ON DELETE CASCADE;

ALTER TABLE brevetinventeurs ADD CONSTRAINT fk_brevetinventeurs_brevets_id_brevet FOREIGN KEY (id_brevet) REFERENCES brevets (id_brevet) ON DELETE CASCADE;

ALTER TABLE brevetinventeurs ADD CONSTRAINT fk_brevetinventeurs_inventeurs_id_inventeur FOREIGN KEY (id_inventeur) REFERENCES inventeurs (id) ON DELETE CASCADE;

ALTER TABLE brevettitulaires ADD CONSTRAINT fk_brevettitulaires_brevets_id_brevet FOREIGN KEY (id_brevet) REFERENCES brevets (id_brevet) ON DELETE CASCADE;

ALTER TABLE brevettitulaires ADD CONSTRAINT fk_brevettitulaires_titulaires_id_titulaire FOREIGN KEY (id_titulaire) REFERENCES titulaires (id) ON DELETE CASCADE;

ALTER TABLE clientcabinets ADD CONSTRAINT fk_clientcabinets_cabinets_cabinetid FOREIGN KEY (cabinetid) REFERENCES cabinets (id) ON DELETE CASCADE;

ALTER TABLE clientcabinets ADD CONSTRAINT fk_clientcabinets_clients_clientid FOREIGN KEY (clientid) REFERENCES clients (id) ON DELETE CASCADE;

ALTER TABLE contacts ADD CONSTRAINT fk_contacts_cabinets_id_cabinet FOREIGN KEY (id_cabinet) REFERENCES cabinets (id) ON DELETE SET NULL;

ALTER TABLE contacts ADD CONSTRAINT fk_contacts_clients_id_client FOREIGN KEY (id_client) REFERENCES clients (id) ON DELETE SET NULL;

ALTER TABLE deposantpays ADD CONSTRAINT fk_deposantpays_brevets_id_brevet FOREIGN KEY (id_brevet) REFERENCES brevets (id_brevet) ON DELETE SET NULL;

ALTER TABLE deposantpays ADD CONSTRAINT fk_deposantpays_deposants_id_deposant FOREIGN KEY (id_deposant) REFERENCES deposants (id) ON DELETE CASCADE;

ALTER TABLE deposantpays ADD CONSTRAINT fk_deposantpays_pays_id_pays FOREIGN KEY (id_pays) REFERENCES pays (id) ON DELETE CASCADE;

ALTER TABLE informationdepotcabinetcontacts ADD CONSTRAINT fk_informationdepotcabinetcontacts_contacts_contact_id FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE;

ALTER TABLE informationdepotcabinetcontacts ADD CONSTRAINT "fk_informationdepotcabinetcontacts_informationdepotcabinets_in~" FOREIGN KEY (information_depot_cabinet_id) REFERENCES informationdepotcabinets (id) ON DELETE CASCADE;

ALTER TABLE informationdepotcabinetroles ADD CONSTRAINT "fk_informationdepotcabinetroles_informationdepotcabinets_infor~" FOREIGN KEY (information_depot_cabinet_id) REFERENCES informationdepotcabinets (id) ON DELETE CASCADE;

ALTER TABLE informationdepotcabinets ADD CONSTRAINT fk_informationdepotcabinets_cabinets_cabinet_id FOREIGN KEY (cabinet_id) REFERENCES cabinets (id) ON DELETE CASCADE;

ALTER TABLE informationdepotcabinets ADD CONSTRAINT "fk_informationdepotcabinets_informationsdepot_information_depo~" FOREIGN KEY (information_depot_id) REFERENCES informationsdepot (id) ON DELETE CASCADE;

ALTER TABLE informationsdepot ADD CONSTRAINT fk_informationsdepot_brevets_id_brevet FOREIGN KEY (id_brevet) REFERENCES brevets (id_brevet) ON DELETE CASCADE;

ALTER TABLE informationsdepot ADD CONSTRAINT fk_informationsdepot_pays_id_pays FOREIGN KEY (id_pays) REFERENCES pays (id);

ALTER TABLE informationsdepot ADD CONSTRAINT fk_informationsdepot_statuts_id_statuts FOREIGN KEY (id_statuts) REFERENCES statuts (id);

ALTER TABLE inventeurpays ADD CONSTRAINT fk_inventeurpays_brevets_id_brevet FOREIGN KEY (id_brevet) REFERENCES brevets (id_brevet) ON DELETE SET NULL;

ALTER TABLE inventeurpays ADD CONSTRAINT fk_inventeurpays_inventeurs_id_inventeur FOREIGN KEY (id_inventeur) REFERENCES inventeurs (id) ON DELETE CASCADE;

ALTER TABLE inventeurpays ADD CONSTRAINT fk_inventeurpays_pays_id_pays FOREIGN KEY (id_pays) REFERENCES pays (id) ON DELETE CASCADE;

ALTER TABLE numeropays ADD CONSTRAINT fk_numeropays_pays_paysid FOREIGN KEY (paysid) REFERENCES pays (id);

ALTER TABLE titulairepays ADD CONSTRAINT fk_titulairepays_brevets_id_brevet FOREIGN KEY (id_brevet) REFERENCES brevets (id_brevet) ON DELETE SET NULL;

ALTER TABLE titulairepays ADD CONSTRAINT fk_titulairepays_pays_id_pays FOREIGN KEY (id_pays) REFERENCES pays (id) ON DELETE CASCADE;

ALTER TABLE titulairepays ADD CONSTRAINT fk_titulairepays_titulaires_id_titulaire FOREIGN KEY (id_titulaire) REFERENCES titulaires (id) ON DELETE CASCADE;

ALTER TABLE userroles ADD CONSTRAINT fk_userroles_clients_clientid FOREIGN KEY (clientid) REFERENCES clients (id) ON DELETE CASCADE;

ALTER TABLE userroles ADD CONSTRAINT fk_userroles_roles_roleid FOREIGN KEY (roleid) REFERENCES roles (id) ON DELETE CASCADE;

ALTER TABLE userroles ADD CONSTRAINT fk_userroles_users_userid FOREIGN KEY (userid) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE users ADD CONSTRAINT fk_users_clients_clientid FOREIGN KEY (clientid) REFERENCES clients (id) ON DELETE SET NULL;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250824143949_AddInformationDepotCabinetSets', '8.0.4');

COMMIT;

