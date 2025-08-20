/*
 * ================================================================================================
 * CONTEXTE PRINCIPAL BASE DONNÉES - ARCHITECTURE PROPRIÉTÉ INTELLECTUELLE AVANCÉE
 * ================================================================================================
 * 
 * OBJECTIF :
 * Contexte Entity Framework Core principal avec architecture complète pour gestion
 * propriété intellectuelle incluant système rôles granulaires et relations client-cabinet.
 * 
 * ÉVOLUTION ARCHITECTURE :
 * =======================
 * 
 * 🏗️ VERSION ÉTENDUE vs AppDbContext :
 *    - Système rôles granulaires (Role, UserRole)
 *    - Relations client-cabinet (ClientCabinet)
 *    - Gestion timestamps automatique
 *    - Index uniques renforcés
 *    - Contraintes métier étendues
 * 
 * 👥 SYSTÈME RÔLES AVANCÉ :
 *    - Role : Définition rôles métier (admin, user, client)
 *    - UserRole : Attribution rôles par client (granularité fine)
 *    - User.ClientId : Liaison utilisateurs externes clients
 *    - Permissions contextuelles par portefeuille client
 * 
 * 🏢 RELATIONS CABINET-CLIENT :
 *    - ClientCabinet : Mandats représentation PI
 *    - Gestion portefeuilles clients par cabinet
 *    - Traçabilité relations commerciales
 *    - Optimisation accès données selon mandats
 * 
 * OPTIMISATIONS PERFORMANCE :
 * ===========================
 * 🚀 INDEX STRATÉGIQUES RENFORCÉS :
 *    - Index uniques relations M2M (évite doublons)
 *    - Index composites rôles utilisateurs
 *    - Index recherches fréquentes optimisées
 *    - Index liaison client-cabinet rapide
 * 
 * 🔧 CONTRAINTES MÉTIER :
 *    - Cascade delete intelligente
 *    - SetNull pour préservation données
 *    - Valeurs par défaut sécurisées
 *    - Unicité garantie relations critiques
 * 
 * FONCTIONNALITÉS AVANCÉES :
 * ==========================
 * ⏰ GESTION TIMESTAMPS AUTOMATIQUE :
 *    - CreatedAt/UpdatedAt sur entités principales
 *    - Override SaveChanges pour automation
 *    - Traçabilité modifications selon RGPD
 * 
 * 🎯 DONNÉES RÉFÉRENCE INTÉGRÉES :
 *    - Rôles système pré-configurés
 *    - Descriptions métier explicites
 *    - Séparation employés/clients claire
 * 
 * CONFORMITÉ ET SÉCURITÉ :
 * ========================
 * ✅ Granularité rôles selon principes least privilege
 * ✅ Traçabilité complète modifications (audit RGPD)
 * ✅ Relations métier propriété intellectuelle
 * ✅ Performance optimisée requêtes complexes
 * ✅ Intégrité référentielle stricte
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;
using StartingBloch.Backend.Models;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Globalization;

namespace StartingBloch.Backend.Data;

/// <summary>
/// Contexte Entity Framework Core principal avec architecture avancée propriété intellectuelle.
/// Inclut système rôles granulaires, relations client-cabinet et gestion timestamps automatique.
/// Version étendue d'AppDbContext pour besoins métier complexes et multi-tenancy.
/// </summary>
public class StartingBlochDbContext : DbContext
{
    private readonly IHttpContextAccessor? _httpContextAccessor;
    /// <summary>
    /// Initialise le contexte avec configuration Entity Framework avancée.
    /// </summary>
    /// <param name="options">Options configuration base données avec provider</param>
    /// <param name="httpContextAccessor">Accès au contexte HTTP courant pour récupérer l'utilisateur</param>
    public StartingBlochDbContext(DbContextOptions<StartingBlochDbContext> options, IHttpContextAccessor? httpContextAccessor = null) : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    // ================================================================================================
    // ENTITÉS PRINCIPALES AVEC EXTENSIONS MÉTIER
    // ================================================================================================

    /// <summary>Utilisateurs avec liaison client optionnelle</summary>
    public DbSet<User> Users { get; set; }
    
    /// <summary>Clients avec gestion portefeuilles étendus</summary>
    public DbSet<Client> Clients { get; set; }
    
    /// <summary>Brevets - Cœur système propriété intellectuelle</summary>
    public DbSet<Brevet> Brevets { get; set; }
    
    /// <summary>Pays avec codes ISO standards</summary>
    public DbSet<Pays> Pays { get; set; }
    
    /// <summary>Statuts lifecycle brevets EPO</summary>
    public DbSet<Statuts> Statuts { get; set; }
    
    /// <summary>Cabinets mandataires avec relations clients</summary>
    public DbSet<Cabinet> Cabinets { get; set; }
    
    /// <summary>Contacts professionnels chiffrés</summary>
    public DbSet<Contact> Contacts { get; set; }
    
    /// <summary>Inventeurs avec droits moraux</summary>
    public DbSet<Inventeur> Inventeurs { get; set; }
    
    /// <summary>Déposants entités juridiques</summary>
    public DbSet<Deposant> Deposants { get; set; }
    
    /// <summary>Titulaires droits exploitation</summary>
    public DbSet<Titulaire> Titulaires { get; set; }
    
    /// <summary>Logs audit trail RGPD</summary>
    public DbSet<Log> Logs { get; set; }
    
    /// <summary>Informations dépôt officielles</summary>
    public DbSet<InformationDepot> InformationsDepot { get; set; }
    public DbSet<InformationDepotCabinet> InformationDepotCabinets { get; set; }
    public DbSet<InformationDepotCabinetRole> InformationDepotCabinetRoles { get; set; }
    public DbSet<InformationDepotCabinetContact> InformationDepotCabinetContacts { get; set; }

    // ================================================================================================
    // SYSTÈME RÔLES GRANULAIRES AVANCÉ
    // ================================================================================================

    /// <summary>Définitions rôles métier (admin, user, client)</summary>
    public DbSet<Role> Roles { get; set; }
    
    /// <summary>Attribution rôles par utilisateur et client (granularité fine)</summary>
    public DbSet<UserRole> UserRoles { get; set; }

    // ================================================================================================
    // TABLES LIAISON MANY-TO-MANY ÉTENDUES
    // ================================================================================================

    /// <summary>Liaison Brevets ↔ Clients propriété</summary>
    public DbSet<BrevetClient> BrevetClients { get; set; }
    
    /// <summary>Liaison Brevets ↔ Inventeurs créateurs</summary>
    public DbSet<BrevetInventeur> BrevetInventeurs { get; set; }
    
    /// <summary>Liaison Brevets ↔ Déposants juridiques</summary>
    public DbSet<BrevetDeposant> BrevetDeposants { get; set; }
    
    /// <summary>Liaison Brevets ↔ Titulaires exploitation</summary>
    public DbSet<BrevetTitulaire> BrevetTitulaires { get; set; }
    
    /// <summary>Liaison Brevets ↔ Cabinets représentation</summary>
    public DbSet<BrevetCabinet> BrevetCabinets { get; set; }
    
    /// <summary>Liaison Inventeurs ↔ Pays résidence</summary>
    public DbSet<InventeurPays> InventeurPays { get; set; }
    
    /// <summary>Liaison Déposants ↔ Pays établissement</summary>
    public DbSet<DeposantPays> DeposantPays { get; set; }
    
    /// <summary>Liaison Titulaires ↔ Pays siège</summary>
    public DbSet<TitulairePays> TitulairePays { get; set; }
    
    /// <summary>Liaison Clients ↔ Cabinets mandats représentation</summary>
    public DbSet<ClientCabinet> ClientCabinets { get; set; }

    /// <summary>Référentiel numéros téléphoniques internationaux par pays</summary>
    public DbSet<NumeroPays> NumeroPays { get; set; }

    /// <summary>
    /// Configure modèle avancé avec rôles granulaires, relations étendues et optimisations.
    /// Applique contraintes métier propriété intellectuelle et bonnes pratiques performance.
    /// </summary>
    /// <param name="modelBuilder">Builder Entity Framework configuration</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Option de compatibilité: forcer tous les noms de tables en minuscules (PostgreSQL non quoté)
        // Activez-la en définissant EF_TABLES_LOWERCASE=true (utile si les tables existent déjà en minuscules)
        var lowerCaseTables = Environment.GetEnvironmentVariable("EF_TABLES_LOWERCASE")?.Equals("true", StringComparison.OrdinalIgnoreCase) == true;
        if (lowerCaseTables)
        {
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                var tableName = entity.GetTableName();
                var schema = entity.GetSchema();
                if (!string.IsNullOrWhiteSpace(tableName))
                {
                    var lower = tableName!.ToLowerInvariant();
                    if (string.IsNullOrWhiteSpace(schema))
                        modelBuilder.Entity(entity.ClrType).ToTable(lower);
                    else
                        modelBuilder.Entity(entity.ClrType).ToTable(lower, schema);
                }
            }
        }

        // Compat Postgres: convertir int(0/1) <-> bool pour colonnes importées en integer
    var providerName = Database.ProviderName ?? string.Empty;
    var isNpgsql = providerName.IndexOf("Npgsql", StringComparison.OrdinalIgnoreCase) >= 0;
        if (isNpgsql)
        {
            var boolProps = modelBuilder.Model.GetEntityTypes()
                .SelectMany(et => et.GetProperties())
                .Where(p => p.ClrType == typeof(bool));

            foreach (var prop in boolProps)
            {
                // Applique une conversion bool <-> int pour lecture/écriture
                modelBuilder.Entity(prop.DeclaringType.ClrType)
                    .Property(prop.Name)
                    .HasConversion<int>();
            }

            // Option: colonnes DateTime stockées en TEXT (import SQLite) -> conversion string ISO <-> DateTime
            var datesAsText = Environment.GetEnvironmentVariable("EF_DATETIME_AS_TEXT")?.Equals("true", StringComparison.OrdinalIgnoreCase) == true;
            if (datesAsText)
            {
                var dtConverter = new ValueConverter<DateTime, string>(
                    v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc).ToString("O", CultureInfo.InvariantCulture) : v.ToUniversalTime().ToString("O", CultureInfo.InvariantCulture),
                    s => DateTime.Parse(s, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind)
                );
                var ndtConverter = new ValueConverter<DateTime?, string?>(
                    v => v.HasValue ? (v.Value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc).ToString("O", CultureInfo.InvariantCulture) : v.Value.ToUniversalTime().ToString("O", CultureInfo.InvariantCulture)) : null,
                    s => string.IsNullOrWhiteSpace(s) ? (DateTime?)null : DateTime.Parse(s, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind)
                );

                var dtProps = modelBuilder.Model.GetEntityTypes()
                    .SelectMany(et => et.GetProperties())
                    .Where(p => p.ClrType == typeof(DateTime) || p.ClrType == typeof(DateTime?));

                foreach (var prop in dtProps)
                {
                    if (prop.ClrType == typeof(DateTime))
                    {
                        modelBuilder.Entity(prop.DeclaringType.ClrType)
                            .Property(prop.Name)
                            .HasConversion(dtConverter);
                    }
                    else
                    {
                        modelBuilder.Entity(prop.DeclaringType.ClrType)
                            .Property(prop.Name)
                            .HasConversion(ndtConverter);
                    }
                }
            }
        }

        ConfigureIndexes(modelBuilder);
        ConfigureRelations(modelBuilder);
        ConfigureDefaultValues(modelBuilder);
    ConfigureSeedData(modelBuilder);
    }

    /// <summary>
    /// Configure les index optimisés pour requêtes fréquentes et contraintes unicité.
    /// </summary>
    /// <param name="modelBuilder">Builder pour configuration index</param>
    private static void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        // Index recherches entités principales
        modelBuilder.Entity<Client>()
            .HasIndex(c => c.NomClient)
            .HasDatabaseName("IX_Clients_NomClient");

        modelBuilder.Entity<Brevet>()
            .HasIndex(b => b.ReferenceFamille)
            .HasDatabaseName("IX_Brevets_ReferenceFamille");

        // Index authentification uniques
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique()
            .HasDatabaseName("IX_Users_Username");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.ClientId)
            .HasDatabaseName("IX_Users_ClientId");

        // Index relations Many-to-Many uniques
        modelBuilder.Entity<BrevetClient>()
            .HasIndex(bc => new { bc.IdBrevet, bc.IdClient })
            .IsUnique()
            .HasDatabaseName("IX_BrevetClients_Unique");

        modelBuilder.Entity<BrevetInventeur>()
            .HasIndex(bi => new { bi.IdBrevet, bi.IdInventeur })
            .IsUnique()
            .HasDatabaseName("IX_BrevetInventeurs_Unique");

        modelBuilder.Entity<BrevetDeposant>()
            .HasIndex(bd => new { bd.IdBrevet, bd.IdDeposant })
            .IsUnique()
            .HasDatabaseName("IX_BrevetDeposants_Unique");

        modelBuilder.Entity<BrevetTitulaire>()
            .HasIndex(bt => new { bt.IdBrevet, bt.IdTitulaire })
            .IsUnique()
            .HasDatabaseName("IX_BrevetTitulaires_Unique");

        // Index système rôles granulaires
        modelBuilder.Entity<UserRole>()
            .HasIndex(ur => new { ur.UserId, ur.RoleId, ur.ClientId })
            .IsUnique()
            .HasDatabaseName("IX_UserRoles_Unique");

        modelBuilder.Entity<ClientCabinet>()
            .HasIndex(cc => new { cc.ClientId, cc.CabinetId })
            .IsUnique()
            .HasDatabaseName("IX_ClientCabinets_Unique");

        modelBuilder.Entity<Role>()
            .HasIndex(r => r.Name)
            .IsUnique()
            .HasDatabaseName("IX_Roles_Name");

        // Unicité: un cabinet par catégorie par information de dépôt
        modelBuilder.Entity<InformationDepotCabinet>()
            .HasIndex(x => new { x.InformationDepotId, x.CabinetId, x.Category })
            .IsUnique()
            .HasDatabaseName("IX_InfoDepotCab_Unique");

        // Unicité: un rôle par infoDepotCabinet
        modelBuilder.Entity<InformationDepotCabinetRole>()
            .HasIndex(x => new { x.InformationDepotCabinetId, x.Role })
            .IsUnique()
            .HasDatabaseName("IX_InfoDepotCabRole_Unique");

        // Unicité: un contact par infoDepotCabinet
        modelBuilder.Entity<InformationDepotCabinetContact>()
            .HasIndex(x => new { x.InformationDepotCabinetId, x.ContactId })
            .IsUnique()
            .HasDatabaseName("IX_InfoDepotCabContact_Unique");
    }

    /// <summary>
    /// Configure les relations entre entités avec contraintes cascade appropriées.
    /// </summary>
    /// <param name="modelBuilder">Builder pour configuration relations</param>
    private static void ConfigureRelations(ModelBuilder modelBuilder)
    {
        // Relations brevets avec cascade
        modelBuilder.Entity<InformationDepot>()
            .HasOne(i => i.Brevet)
            .WithMany(b => b.InformationsDepot)
            .HasForeignKey(i => i.IdBrevet)
            .OnDelete(DeleteBehavior.Cascade);

        // Relations optionnelles vers Brevet depuis InventeurPays/DeposantPays/TitulairePays
        // Lors de la suppression d'un Brevet, on ne supprime pas ces liaisons pays: on passe la FK à NULL
        modelBuilder.Entity<InventeurPays>()
            .HasOne(ip => ip.Brevet)
            .WithMany()
            .HasForeignKey(ip => ip.IdBrevet)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<DeposantPays>()
            .HasOne(dp => dp.Brevet)
            .WithMany()
            .HasForeignKey(dp => dp.IdBrevet)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<TitulairePays>()
            .HasOne(tp => tp.Brevet)
            .WithMany()
            .HasForeignKey(tp => tp.IdBrevet)
            .OnDelete(DeleteBehavior.SetNull);

        // Relations contacts avec préservation données
        modelBuilder.Entity<Contact>()
            .HasOne(c => c.Cabinet)
            .WithMany(cab => cab.Contacts)
            .HasForeignKey(c => c.IdCabinet)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Contact>()
            .HasOne(c => c.Client)
            .WithMany(cl => cl.Contacts)
            .HasForeignKey(c => c.IdClient)
            .OnDelete(DeleteBehavior.SetNull);

        // Relations système rôles utilisateurs
        modelBuilder.Entity<User>()
            .HasOne(u => u.Client)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.ClientId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Client)
            .WithMany()
            .HasForeignKey(ur => ur.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relations client-cabinet mandats
        modelBuilder.Entity<ClientCabinet>()
            .HasOne(cc => cc.Client)
            .WithMany(c => c.ClientCabinets)
            .HasForeignKey(cc => cc.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ClientCabinet>()
            .HasOne(cc => cc.Cabinet)
            .WithMany(cab => cab.ClientCabinets)
            .HasForeignKey(cc => cc.CabinetId)
            .OnDelete(DeleteBehavior.Cascade);

        // InformationDepotCabinet relations
        modelBuilder.Entity<InformationDepotCabinet>()
            .HasOne(x => x.InformationDepot)
            .WithMany(i => i.InformationDepotCabinets)
            .HasForeignKey(x => x.InformationDepotId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InformationDepotCabinet>()
            .HasOne(x => x.Cabinet)
            .WithMany()
            .HasForeignKey(x => x.CabinetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InformationDepotCabinetRole>()
            .HasOne(x => x.InformationDepotCabinet)
            .WithMany(x => x.Roles)
            .HasForeignKey(x => x.InformationDepotCabinetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InformationDepotCabinetContact>()
            .HasOne(x => x.InformationDepotCabinet)
            .WithMany(x => x.Contacts)
            .HasForeignKey(x => x.InformationDepotCabinetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InformationDepotCabinetContact>()
            .HasOne(x => x.Contact)
            .WithMany()
            .HasForeignKey(x => x.ContactId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    /// <summary>
    /// Configure les valeurs par défaut sécurisées pour les entités.
    /// </summary>
    /// <param name="modelBuilder">Builder pour configuration valeurs</param>
    private static void ConfigureDefaultValues(ModelBuilder modelBuilder)
    {
        // Valeurs par défaut utilisateurs sécurisées
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasDefaultValue("user");

        modelBuilder.Entity<User>()
            .Property(u => u.CanWrite)
            .HasDefaultValue(false);

        modelBuilder.Entity<User>()
            .Property(u => u.IsActive)
            .HasDefaultValue(true);

        // Valeurs par défaut informations dépôt
        modelBuilder.Entity<InformationDepot>()
            .Property(i => i.Licence)
            .HasDefaultValue(false);
    }

    /// <summary>
    /// Configure les données de référence pour système rôles.
    /// </summary>
    /// <param name="modelBuilder">Builder pour configuration seed data</param>
    private static void ConfigureSeedData(ModelBuilder modelBuilder)
    {
        // Note: Le seed des rôles est effectué au démarrage (SeedData.InitializeAsync)
        // pour éviter les InsertData/UpdateData dépendants du provider dans les migrations.
    }

    /// <summary>
    /// Override SaveChanges avec gestion automatique timestamps.
    /// Met à jour CreatedAt/UpdatedAt pour audit trail RGPD.
    /// </summary>
    /// <returns>Nombre d'entités sauvegardées</returns>
    public override int SaveChanges()
    {
    UpdateTimestamps();
    AddAuditLogs();
        return base.SaveChanges();
    }

    /// <summary>
    /// Override SaveChangesAsync avec gestion automatique timestamps.
    /// Version asynchrone pour performance optimale.
    /// </summary>
    /// <param name="cancellationToken">Token annulation opération</param>
    /// <returns>Nombre d'entités sauvegardées</returns>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
    UpdateTimestamps();
    AddAuditLogs();
    return base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Met à jour automatiquement les timestamps sur entités modifiées.
    /// Assure traçabilité modifications selon exigences RGPD.
    /// </summary>
    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            // Mise à jour timestamps Client (extensible autres entités)
            if (entry.Entity is Client client)
            {
                if (entry.State == EntityState.Added)
                    client.CreatedAt = DateTime.UtcNow;
                client.UpdatedAt = DateTime.UtcNow;
            }
            // TODO: Implémenter interface ITimestamped pour optimisation
        }
    }

    /// <summary>
    /// Génère des entrées de logs (table Logs) pour les opérations CRUD détectées par EF Core.
    /// Renseigne OldValues/NewValues en JSON pour permettre l'affichage des avant/après.
    /// </summary>
    private void AddAuditLogs()
    {
        // Collecter les entrées pertinentes avant le SaveChanges réel
        var auditEntries = ChangeTracker.Entries()
            .Where(e =>
                e.Entity is not Log && // éviter la récursion sur la table des logs
                (e.State == EntityState.Modified || e.State == EntityState.Added || e.State == EntityState.Deleted))
            .ToList();

        if (auditEntries.Count == 0)
            return;

        foreach (var entry in auditEntries)
        {
            try
            {
                // Déterminer le type d'entité et l'identifiant (si disponible)
                var entityType = entry.Entity.GetType();
                var entityName = entityType.Name; // ex: Client, Brevet
                var tableName = entry.Metadata.GetTableName() ?? entityName;

                int? recordId = null;
                var idProp = entityType.GetProperty("Id");
                if (idProp != null)
                {
                    var idValue = entry.State == EntityState.Added
                        ? entry.CurrentValues[idProp.Name]
                        : entry.OriginalValues[idProp.Name];
                    if (idValue is int intId)
                        recordId = intId;
                    else if (idValue != null && int.TryParse(idValue.ToString(), out var parsed))
                        recordId = parsed;
                }

                // Préparer Old/New values
                Dictionary<string, object?>? oldValues = null;
                Dictionary<string, object?>? newValues = null;

                // Propriétés à ignorer dans le diff (bruit)
                var ignoreProps = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    "UpdatedAt", "CreatedAt"
                };

                if (entry.State == EntityState.Modified)
                {
                    foreach (var prop in entry.Properties)
                    {
                        if (!prop.IsModified)
                            continue;
                        if (ignoreProps.Contains(prop.Metadata.Name))
                            continue;

                        oldValues ??= new Dictionary<string, object?>();
                        newValues ??= new Dictionary<string, object?>();
                        oldValues[prop.Metadata.Name] = prop.OriginalValue;
                        newValues[prop.Metadata.Name] = prop.CurrentValue;
                    }
                }
                else if (entry.State == EntityState.Added)
                {
                    newValues = entry.Properties
                        .Where(p => !ignoreProps.Contains(p.Metadata.Name))
                        .ToDictionary(p => p.Metadata.Name, p => p.CurrentValue);
                }
                else if (entry.State == EntityState.Deleted)
                {
                    oldValues = entry.Properties
                        .Where(p => !ignoreProps.Contains(p.Metadata.Name))
                        .ToDictionary(p => p.Metadata.Name, p => p.OriginalValue);
                }

                // Ne créer un log que si on a des valeurs utiles (pour Modified)
                if (entry.State == EntityState.Modified && (oldValues == null || newValues == null || oldValues.Count == 0))
                    continue;

                var action = entry.State switch
                {
                    EntityState.Added => $"Création d'un {entityName.ToLower()}",
                    EntityState.Modified => $"Modification d'un {entityName.ToLower()}",
                    EntityState.Deleted => $"Suppression d'un {entityName.ToLower()}",
                    _ => entry.State.ToString()
                };

                var changedFields = entry.State == EntityState.Modified && newValues != null
                    ? string.Join(", ", newValues.Keys)
                    : entry.State == EntityState.Added && newValues != null
                        ? string.Join(", ", newValues.Keys)
                        : entry.State == EntityState.Deleted && oldValues != null
                            ? string.Join(", ", oldValues.Keys)
                            : string.Empty;

                var details = string.IsNullOrWhiteSpace(changedFields)
                    ? null
                    : $"Champs concernés: {changedFields}";

                // Récupérer l'utilisateur courant si disponible (JWT)
                string? userId = null;
                try
                {
                    var httpContext = _httpContextAccessor?.HttpContext;
                    if (httpContext?.User?.Identity?.IsAuthenticated == true)
                    {
                        userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                                 ?? httpContext.User.FindFirst("nameid")?.Value
                                 ?? httpContext.User.FindFirst("sub")?.Value
                                 ?? httpContext.User.FindFirst("id")?.Value;
                    }
                }
                catch
                {
                    // Ne pas bloquer l'audit si le contexte HTTP n'est pas disponible (jobs, seeds, tests)
                }

                var log = new Log
                {
                    Level = "info",
                    Message = $"{action} {(recordId.HasValue ? "(ID=" + recordId.Value + ")" : string.Empty)}",
                    Timestamp = DateTime.UtcNow,
                    UserId = userId,
                    Action = action,
                    TableName = tableName,
                    RecordId = recordId,
                    OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                    NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                    IpAddress = null,
                    UserAgent = null,
                    CreatedAt = DateTime.UtcNow,
                    Details = details
                };

                Logs.Add(log);
            }
            catch
            {
                // En cas d'erreur dans l'audit, ne pas bloquer la sauvegarde
            }
        }
    }
}
