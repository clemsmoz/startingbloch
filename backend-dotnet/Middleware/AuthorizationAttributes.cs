/*
 * ================================================================================================
 * ATTRIBUTS AUTORISATION PROPRIÉTÉ INTELLECTUELLE - CONTRÔLE ACCÈS GRANULAIRE
 * ================================================================================================
 * 
 * OBJECTIF :
 * Fournit un système d'autorisation spécialisé pour la gestion de propriété intellectuelle
 * avec contrôle d'accès granulaire selon rôles métier et propriété des données.
 * 
 * ARCHITECTURE RÔLES MÉTIER :
 * ===========================
 * 
 * 👑 ADMIN : Accès complet (super-utilisateur)
 *    - Gestion tous brevets, clients, inventeurs
 *    - Administration système et utilisateurs
 *    - Accès données confidentielles toutes entités
 * 
 * 👨‍💼 USER (Employé StartingBloch) : Accès opérationnel
 *    - Consultation/modification brevets assignés
 *    - Gestion relations clients selon portefeuille
 *    - Accès données selon permissions granulaires
 * 
 * 🏢 CLIENT : Accès propriétaire strictement limité
 *    - Consultation uniquement SES brevets/inventions
 *    - Pas d'accès données autres clients
 *    - Protection stricte confidentialité industrielle
 * 
 * POLITIQUES AUTORISATION AVANCÉES :
 * ==================================
 * 
 * 🔐 AdminOrOwner : Admin OU propriétaire ressource
 *    - Cas usage : Accès dossiers brevets confidentiels
 *    - Validation : Role=admin OU clientId match ressource
 * 
 * ✍️ WritePermission : Droits modification granulaires
 *    - Cas usage : Modification données sensibles brevets
 *    - Validation : Role=admin OU claim canWrite=true
 * 
 * SÉCURITÉ ET CONFORMITÉ :
 * ========================
 * ✅ Isolation stricte données clients (confidentialité industrielle)
 * ✅ Traçabilité accès selon rôles (audit RGPD)
 * ✅ Protection secrets industriels et innovations
 * ✅ Conformité réglementations propriété intellectuelle
 * 
 * PATTERNS IMPLÉMENTÉS :
 * =====================
 * - Authorization Attributes (déclaratif sur contrôleurs/actions)
 * - Policy-based Authorization (logique métier complexe)
 * - Claims-based Security (permissions granulaires)
 * - Resource-based Authorization (propriété données)
 * 
 * ================================================================================================
 */

using Microsoft.AspNetCore.Authorization;

namespace StartingBloch.Backend.Middleware;

// ================================================================================================
// ATTRIBUTS AUTORISATION RÔLES MÉTIER
// ================================================================================================

/// <summary>
/// Attribut d'autorisation pour accès administrateur uniquement.
/// Utilisé pour opérations critiques : gestion utilisateurs, configuration système,
/// accès données confidentielles toutes entités.
/// </summary>
public class AdminOnlyAttribute : AuthorizeAttribute
{
    /// <summary>
    /// Initialise l'attribut avec restriction rôle administrateur.
    /// </summary>
    public AdminOnlyAttribute()
    {
        Roles = "Admin";
    }
}

/// <summary>
/// Attribut d'autorisation pour employés StartingBloch (admin + user).
/// Utilisé pour opérations internes : gestion brevets, relations clients,
/// consultations données selon permissions.
/// </summary>
public class EmployeeOnlyAttribute : AuthorizeAttribute
{
    /// <summary>
    /// Initialise l'attribut avec accès employés internes.
    /// </summary>
    public EmployeeOnlyAttribute()
    {
        Roles = "Admin,User";
    }
}

/// <summary>
/// Attribut d'autorisation pour clients externes uniquement.
/// Utilisé pour portails clients : consultation brevets propriétaires,
/// accès limité données personnelles.
/// </summary>
public class ClientOnlyAttribute : AuthorizeAttribute
{
    /// <summary>
    /// Initialise l'attribut avec restriction clients externes.
    /// </summary>
    public ClientOnlyAttribute()
    {
        Roles = "client";
    }
}

// ================================================================================================
// ATTRIBUTS AUTORISATION POLITIQUES AVANCÉES
// ================================================================================================

/// <summary>
/// Attribut d'autorisation pour admin OU propriétaire de la ressource.
/// Utilisé pour données sensibles : dossiers brevets confidentiels,
/// informations stratégiques clients.
/// </summary>
public class AdminOrOwnerAttribute : AuthorizeAttribute
{
    /// <summary>
    /// Initialise l'attribut avec politique propriété ressource.
    /// </summary>
    public AdminOrOwnerAttribute()
    {
        Policy = "AdminOrOwner";
    }
}

/// <summary>
/// Attribut d'autorisation pour droits d'écriture granulaires.
/// Utilisé pour modifications critiques : données brevets,
/// informations confidentielles, statuts juridiques.
/// </summary>
public class WritePermissionAttribute : AuthorizeAttribute
{
    /// <summary>
    /// Initialise l'attribut avec politique permissions écriture.
    /// </summary>
    public WritePermissionAttribute()
    {
        Policy = "WritePermission";
    }
}

// ================================================================================================
// EXIGENCES POLITIQUES PERSONNALISÉES
// ================================================================================================

/// <summary>
/// Exigence pour validation admin OU propriétaire ressource.
/// Permet contrôle accès granulaire selon propriété données et rôle utilisateur.
/// </summary>
public class AdminOrOwnerRequirement : IAuthorizationRequirement
{
    /// <summary>
    /// ID du client propriétaire de la ressource demandée.
    /// Null = pas de vérification propriété (admin seul autorisé).
    /// </summary>
    public int? ResourceClientId { get; set; }
}

/// <summary>
/// Exigence pour validation droits d'écriture granulaires.
/// Permet contrôle modifications selon permissions utilisateur et criticité données.
/// </summary>
public class WritePermissionRequirement : IAuthorizationRequirement
{
}

// ================================================================================================
// GESTIONNAIRES AUTORISATION MÉTIER
// ================================================================================================

/// <summary>
/// Gestionnaire autorisation pour politique AdminOrOwner.
/// Valide l'accès selon rôle admin OU propriété de la ressource par le client.
/// 
/// LOGIQUE MÉTIER :
/// - Admin : Accès total (gestion portefeuille complet)
/// - Client : Accès limité à SES données uniquement
/// - Isolation stricte données clients (confidentialité industrielle)
/// </summary>
public class AdminOrOwnerHandler : AuthorizationHandler<AdminOrOwnerRequirement>
{
    /// <summary>
    /// Évalue l'autorisation selon rôle et propriété ressource.
    /// </summary>
    /// <param name="context">Contexte autorisation avec claims utilisateur</param>
    /// <param name="requirement">Exigence avec ID client propriétaire</param>
    /// <returns>Task pour traitement asynchrone</returns>
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AdminOrOwnerRequirement requirement)
    {
        var userRole = context.User.FindFirst("role")?.Value;
        var userClientId = context.User.FindFirst("clientId")?.Value;

        // Admin : Accès complet toutes ressources
        if (userRole == "admin")
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Client : Accès strictement limité à ses données
        if (userRole == "client" && 
            requirement.ResourceClientId.HasValue &&
            int.TryParse(userClientId, out var clientId) &&
            clientId == requirement.ResourceClientId.Value)
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Échec autorisation : rôle insuffisant ou ressource non propriétaire
        context.Fail();
        return Task.CompletedTask;
    }
}

/// <summary>
/// Gestionnaire autorisation pour politique WritePermission.
/// Valide les droits d'écriture selon rôle et permissions granulaires.
/// 
/// LOGIQUE MÉTIER :
/// - Admin : Droits écriture complets par défaut
/// - Autres : Validation claim canWrite selon permissions assignées
/// - Protection modifications données critiques brevets
/// </summary>
public class WritePermissionHandler : AuthorizationHandler<WritePermissionRequirement>
{
    /// <summary>
    /// Évalue l'autorisation d'écriture selon rôle et permissions.
    /// </summary>
    /// <param name="context">Contexte autorisation avec claims utilisateur</param>
    /// <param name="requirement">Exigence permissions écriture</param>
    /// <returns>Task pour traitement asynchrone</returns>
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        WritePermissionRequirement requirement)
    {
        var canWrite = context.User.FindFirst("canWrite")?.Value;
        var userRole = context.User.FindFirst("role")?.Value;

        // Admin : Droits écriture automatiques
        if (userRole == "admin")
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Autres rôles : Validation claim permissions
        if (bool.TryParse(canWrite, out var hasWritePermission) && hasWritePermission)
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Échec autorisation : permissions insuffisantes
        context.Fail();
        return Task.CompletedTask;
    }
}
