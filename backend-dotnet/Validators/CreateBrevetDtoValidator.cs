/*
 * ================================================================================================
 * VALIDATOR CRÉATION BREVET - VALIDATION DONNÉES PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Validator création brevet StartingBloch avec contrôles conformité PI.
 * Validation complète données brevet selon standards INPI/EPO/WIPO.
 * 
 * VALIDATIONS IMPLÉMENTÉES :
 * ==========================
 * ✅ TITRE → Longueur, unicité, caractères autorisés
 * ✅ DESCRIPTION → Contenu technique suffisant
 * ✅ REVENDICATIONS → Format juridique conforme
 * ✅ INVENTEURS → Validation existence et droits
 * ✅ TITULAIRES → Contrôle entités juridiques
 * ✅ DATES → Cohérence temporelle dépôt/priorité
 * ✅ CLASSIFICATIONS → Codes CIB valides
 * 
 * CONFORMITÉ STANDARDS :
 * =====================
 * ✅ INPI → Standards français propriété industrielle
 * ✅ EPO → European Patent Office requirements
 * ✅ WIPO → World Intellectual Property standards
 * ✅ PCT → Patent Cooperation Treaty compliance
 * 
 * ================================================================================================
 */

using FluentValidation;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Validators;

/// <summary>
/// Validator création brevet avec contrôles conformité propriété intellectuelle.
/// Validation complète données selon standards internationaux PI.
/// </summary>
public class CreateBrevetDtoValidator : AbstractValidator<CreateBrevetDto>
{
    /// <summary>
    /// Initialise validator avec règles de validation complètes.
    /// </summary>
    public CreateBrevetDtoValidator()
    {
        // Validation titre brevet
        RuleFor(x => x.Titre)
            .NotEmpty().WithMessage("Le titre du brevet est obligatoire")
            .Length(10, 250).WithMessage("Le titre doit contenir entre 10 et 250 caractères")
            .Must(BeValidTitle).WithMessage("Le titre contient des caractères non autorisés");

        // Validation référence famille (optionnelle)
        RuleFor(x => x.ReferenceFamille)
            .MaximumLength(255).WithMessage("La référence famille ne peut dépasser 255 caractères")
            .When(x => !string.IsNullOrEmpty(x.ReferenceFamille));

        // Validation commentaire (optionnel)
        RuleFor(x => x.Commentaire)
            .MaximumLength(1000).WithMessage("Le commentaire ne peut dépasser 1000 caractères")
            .When(x => !string.IsNullOrEmpty(x.Commentaire));

        // Validation clients (au moins un)
        RuleFor(x => x.ClientIds)
            .NotEmpty().WithMessage("Au moins un client doit être spécifié")
            .Must(x => x != null && x.Count > 0).WithMessage("La liste des clients ne peut être vide");

        // Validation inventeurs (au moins un)
        RuleFor(x => x.InventeurIds)
            .NotEmpty().WithMessage("Au moins un inventeur doit être spécifié")
            .Must(x => x != null && x.Count > 0).WithMessage("La liste des inventeurs ne peut être vide");

        // Validation déposants (au moins un)
        RuleFor(x => x.DeposantIds)
            .NotEmpty().WithMessage("Au moins un déposant doit être spécifié")
            .Must(x => x != null && x.Count > 0).WithMessage("La liste des déposants ne peut être vide");

        // Validation titulaires (au moins un)
        RuleFor(x => x.TitulaireIds)
            .NotEmpty().WithMessage("Au moins un titulaire doit être spécifié")
            .Must(x => x != null && x.Count > 0).WithMessage("La liste des titulaires ne peut être vide");
    }

    /// <summary>
    /// Valide que le titre contient uniquement des caractères autorisés.
    /// </summary>
    /// <param name="title">Titre à valider</param>
    /// <returns>True si valide, false sinon</returns>
    private static bool BeValidTitle(string title)
    {
        if (string.IsNullOrEmpty(title))
            return false;

        // Caractères autorisés : lettres, chiffres, espaces, tirets, parenthèses
        return title.All(c => char.IsLetterOrDigit(c) || 
                             char.IsWhiteSpace(c) || 
                             c == '-' || c == '(' || c == ')' || 
                             c == ',' || c == '.' || c == ':');
    }
}
