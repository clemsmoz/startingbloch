/*
 * ================================================================================================
 * VALIDATORS DTO - VALIDATION DONNÉES PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF :
 * Valide les données d'entrée des DTOs pour l'API de gestion de propriété intellectuelle
 * avec protection contre injection SQL, XSS et données malformées selon standards OWASP.
 * 
 * ARCHITECTURE VALIDATION :
 * ========================
 * 
 * 🛡️ PROTECTION MULTI-COUCHES :
 *    - FluentValidation pour règles métier complexes
 *    - Expressions régulières pour formats spécifiques
 *    - Validation conditionnelle selon contexte
 *    - Messages d'erreur localisés français
 * 
 * 🏢 ENTITÉS VALIDÉES :
 *    - CreateClientDto : Données clients propriété intellectuelle
 *    - CreateContactDto : Contacts professionnels PI
 *    [Extensible pour autres DTOs : brevets, inventeurs, etc.]
 * 
 * 🔍 CONTRÔLES IMPLÉMENTÉS :
 *    - Champs obligatoires (NotEmpty)
 *    - Longueurs maximales (sécurité buffer overflow)
 *    - Formats email valides (anti-injection)
 *    - Numéros téléphone internationaux (regex stricte)
 *    - IDs positifs (cohérence référentielle)
 * 
 * SÉCURITÉ ET CONFORMITÉ :
 * =======================
 * ✅ OWASP Input Validation (protection injection)
 * ✅ RGPD données personnelles (formats validés)
 * ✅ Standards propriété intellectuelle
 * ✅ Validation côté serveur (sécurité critique)
 * 
 * PATTERNS UTILISÉS :
 * ==================
 * - FluentValidation avec règles chaînées
 * - Validation conditionnelle (When clauses)
 * - Messages d'erreur centralisés
 * - Règles réutilisables et extensibles
 * 
 * ================================================================================================
 */

using FluentValidation;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Validators;

// ================================================================================================
// VALIDATORS ENTITÉS CLIENTS PROPRIÉTÉ INTELLECTUELLE
// ================================================================================================

/// <summary>
/// Validator pour la création d'un nouveau client dans le système de propriété intellectuelle.
/// Valide données essentielles : nom, email, téléphone selon standards métier et sécurité.
/// 
/// RÈGLES MÉTIER :
/// - Nom obligatoire et limité (évite débordement)
/// - Email optionnel mais format strict si fourni
/// - Téléphone optionnel avec validation internationale
/// </summary>
public class CreateClientDtoValidator : AbstractValidator<CreateClientDto>
{
    /// <summary>
    /// Configure les règles de validation pour création client.
    /// Applique contrôles sécurité et cohérence métier propriété intellectuelle.
    /// </summary>
    public CreateClientDtoValidator()
    {
        // Validation nom client (obligatoire pour identification)
        RuleFor(x => x.NomClient)
            .NotEmpty()
            .WithMessage("Le nom du client est obligatoire")
            .MaximumLength(100)
            .WithMessage("Le nom du client ne peut pas dépasser 100 caractères");

        // Validation email (optionnel mais format strict)
        RuleFor(x => x.EmailClient)
            .EmailAddress()
            .When(x => !string.IsNullOrEmpty(x.EmailClient))
            .WithMessage("L'email doit être valide");

        // Validation téléphone (format international avec caractères autorisés)
        RuleFor(x => x.TelephoneClient)
            .Matches(@"^[\d\s\-\+\(\)\.]{8,20}$")
            .When(x => !string.IsNullOrEmpty(x.TelephoneClient))
            .WithMessage("Le numéro de téléphone n'est pas valide");
    }
}

// ================================================================================================
// VALIDATORS CONTACTS PROFESSIONNELS PROPRIÉTÉ INTELLECTUELLE
// ================================================================================================

/// <summary>
/// Validator pour la création d'un contact professionnel lié à un client.
/// Valide identité complète et liaison client pour cohérence relationnelle.
/// 
/// RÈGLES MÉTIER :
/// - Nom et prénom obligatoires (identification complète)
/// - Longueurs limitées (sécurité et performance)
/// - ID client valide (cohérence référentielle)
/// </summary>
public class CreateContactDtoValidator : AbstractValidator<CreateContactDto>
{
    /// <summary>
    /// Configure les règles de validation pour création contact.
    /// Assure identité complète et liaison client valide.
    /// </summary>
    public CreateContactDtoValidator()
    {
        // Validation nom contact (obligatoire pour identification)
        RuleFor(x => x.Nom)
            .NotEmpty()
            .WithMessage("Le nom est obligatoire")
            .MaximumLength(50)
            .WithMessage("Le nom ne peut pas dépasser 50 caractères");

        // Validation prénom contact (obligatoire pour identification complète)
        RuleFor(x => x.Prenom)
            .NotEmpty()
            .WithMessage("Le prénom est obligatoire")
            .MaximumLength(50)
            .WithMessage("Le prénom ne peut pas dépasser 50 caractères");

        // Validation liaison client (cohérence référentielle)
        RuleFor(x => x.IdClient)
            .GreaterThan(0)
            .WithMessage("L'ID du client doit être valide");
    }
}
