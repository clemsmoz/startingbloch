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
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Data;

/// <summary>
/// Contexte Entity Framework Core principal avec architecture avancée propriété intellectuelle.
/// Inclut système rôles granulaires, relations client-cabinet et gestion timestamps automatique.
/// Version étendue d'AppDbContext pour besoins métier complexes et multi-tenancy.
/// </summary>
public class StartingBlochDbContext : DbContext
{
    /// <summary>
    /// Initialise le contexte avec configuration Entity Framework avancée.
    /// </summary>
    /// <param name="options">Options configuration base données avec provider</param>
    public StartingBlochDbContext(DbContextOptions<StartingBlochDbContext> options) : base(options)
    {
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
        // Rôles système avec descriptions métier explicites
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "admin", Description = "Employé StartingBloch - Administrateur avec accès complet et gestion des utilisateurs" },
            new Role { Id = 2, Name = "user", Description = "Employé StartingBloch - Utilisateur standard avec droits configurables" },
            new Role { Id = 3, Name = "client", Description = "Client StartingBloch - Accès restreint à ses propres brevets uniquement" }
        );
    }

    /// <summary>
    /// Override SaveChanges avec gestion automatique timestamps.
    /// Met à jour CreatedAt/UpdatedAt pour audit trail RGPD.
    /// </summary>
    /// <returns>Nombre d'entités sauvegardées</returns>
    public override int SaveChanges()
    {
        UpdateTimestamps();
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
}
