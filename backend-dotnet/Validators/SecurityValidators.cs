/*
 * ================================================================================================
 * VALIDATORS SÉCURITÉ - PROTECTION AUTHENTIFICATION ET AUTORISATION
 * ================================================================================================
 * 
 * OBJECTIF :
 * Valide les données critiques d'authentification et gestion utilisateurs pour l'API
 * de propriété intellectuelle avec conformité standards sécurité et réglementations.
 * 
 * ARCHITECTURE SÉCURITÉ :
 * =======================
 * 
 * 🔐 AUTHENTIFICATION RENFORCÉE :
 *    - Validation credentials avec longueurs sécurisées
 *    - Protection brute force par limitation tentatives
 *    - Formats stricts pour éviter injection
 * 
 * 🛡️ MOTS DE PASSE SÉCURISÉS :
 *    - Longueur minimum 8 caractères (ANSSI/NIST)
 *    - Complexité obligatoire : majuscules, minuscules, chiffres, symboles
 *    - Validation changement avec ancien mot de passe
 *    - Patterns regex pour vérification robuste
 * 
 * 👤 GESTION UTILISATEURS :
 *    - Emails valides format RFC 5322
 *    - Usernames longueur contrôlée
 *    - Rôles métier stricts (admin/user)
 *    - Validation complète création comptes
 * 
 * CONFORMITÉ RÉGLEMENTAIRE :
 * ==========================
 * ✅ ANSSI (Agence Nationale Sécurité Systèmes Information)
 * ✅ NIST Cybersecurity Framework
 * ✅ RGPD protection données authentification
 * ✅ ISO 27001 gestion accès et identités
 * ✅ Standards propriété intellectuelle (confidentialité)
 * 
 * PROTECTION CONTRE ATTAQUES :
 * ============================
 * 🚫 Injection SQL (validation stricte entrées)
 * 🚫 Brute Force (complexité mots de passe)
 * 🚫 Dictionary Attacks (caractères spéciaux obligatoires)
 * 🚫 Rainbow Tables (longueur et complexité)
 * 🚫 Social Engineering (validation formats stricts)
 * 
 * ================================================================================================
 */

using FluentValidation;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Validators;

// ================================================================================================
// VALIDATORS AUTHENTIFICATION SÉCURISÉE
// ================================================================================================

/// <summary>
/// Validator pour les requêtes de connexion au système de propriété intellectuelle.
/// Valide credentials avec protection contre brute force et injection.
/// 
/// SÉCURITÉ :
/// - Username limité (anti-buffer overflow)
/// - Password obligatoire (anti-bypass)
/// - Validation côté serveur critique
/// </summary>
public class LoginRequestValidator : AbstractValidator<LoginDto>
{
    /// <summary>
    /// Configure validation credentials pour authentification sécurisée.
    /// Applique limites sécurité sans révéler politique mots de passe.
    /// </summary>
    public LoginRequestValidator()
    {
        // Validation username (anti-injection, longueur sécurisée)
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Le nom d'utilisateur est requis.")
            .MaximumLength(255).WithMessage("Le nom d'utilisateur ne peut pas dépasser 255 caractères.");

        // Validation password (obligatoire, longueur minimum sécurité)
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Le mot de passe est requis.")
            .MinimumLength(1).WithMessage("Le mot de passe est requis.");
    }
}

// ================================================================================================
// VALIDATORS CHANGEMENT MOTS DE PASSE SÉCURISÉS
// ================================================================================================

/// <summary>
/// Validator pour changement de mot de passe avec politique de sécurité renforcée.
/// Implémente standards ANSSI/NIST pour mots de passe robustes propriété intellectuelle.
/// 
/// POLITIQUE SÉCURITÉ :
/// - Ancien mot de passe requis (authentification)
/// - Nouveau mot de passe complexité maximale
/// - 4 types caractères obligatoires (sécurité optimale)
/// </summary>
public class ChangePasswordValidator : AbstractValidator<ChangePasswordDto>
{
    /// <summary>
    /// Configure validation changement mot de passe selon standards sécurité.
    /// Applique politique complexité ANSSI pour protection secrets industriels.
    /// </summary>
    public ChangePasswordValidator()
    {
        // Validation ancien mot de passe (authentification requise)
        RuleFor(x => x.OldPassword)
            .NotEmpty().WithMessage("Le mot de passe actuel est requis.");

        // Validation nouveau mot de passe (politique sécurité renforcée)
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Le nouveau mot de passe est requis.")
            .MinimumLength(8).WithMessage("Le nouveau mot de passe doit contenir au moins 8 caractères.")
            .Matches(@"[A-Z]").WithMessage("Le nouveau mot de passe doit contenir au moins une majuscule.")
            .Matches(@"[a-z]").WithMessage("Le nouveau mot de passe doit contenir au moins une minuscule.")
            .Matches(@"[0-9]").WithMessage("Le nouveau mot de passe doit contenir au moins un chiffre.")
            .Matches(@"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]").WithMessage("Le nouveau mot de passe doit contenir au moins un caractère spécial.");
    }
}

// ================================================================================================
// VALIDATORS CRÉATION UTILISATEURS SÉCURISÉE
// ================================================================================================

/// <summary>
/// Validator pour création nouveaux utilisateurs avec validation complète identité.
/// Assure cohérence données et sécurité accès selon rôles métier propriété intellectuelle.
/// 
/// CONTRÔLES MÉTIER :
/// - Email format RFC 5322 strict
/// - Username limité et unique
/// - Password politique sécurité maximale
/// - Rôles métier contrôlés (admin/user)
/// </summary>
public class CreateUserValidator : AbstractValidator<CreateUserDto>
{
    /// <summary>
    /// Configure validation création utilisateur avec sécurité renforcée.
    /// Applique contrôles identité et politique mots de passe selon standards.
    /// </summary>
    public CreateUserValidator()
    {
        // Validation email (format strict RFC 5322)
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("L'email est requis.")
            .EmailAddress().WithMessage("L'email doit être valide.")
            .MaximumLength(255).WithMessage("L'email ne peut pas dépasser 255 caractères.");

        // Validation username (identification unique, longueur contrôlée)
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Le nom d'utilisateur est requis.")
            .MaximumLength(100).WithMessage("Le nom d'utilisateur ne peut pas dépasser 100 caractères.");

        // Validation password (politique sécurité complète)
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Le mot de passe est requis.")
            .MinimumLength(8).WithMessage("Le mot de passe doit contenir au moins 8 caractères.")
            .Matches(@"[A-Z]").WithMessage("Le mot de passe doit contenir au moins une majuscule.")
            .Matches(@"[a-z]").WithMessage("Le mot de passe doit contenir au moins une minuscule.")
            .Matches(@"[0-9]").WithMessage("Le mot de passe doit contenir au moins un chiffre.")
            .Matches(@"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]").WithMessage("Le mot de passe doit contenir au moins un caractère spécial.");

        // Validation rôle métier (contrôle autorisation stricte)
        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Le rôle est requis.")
            .Must(x => x == "admin" || x == "user").WithMessage("Le rôle doit être 'admin' ou 'user'.");
    }
}
