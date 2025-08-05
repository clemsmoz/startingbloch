/*
 * ================================================================================================
 * DTOs INVENTEURS - CRÉATEURS TECHNIQUES INNOVATIONS
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données inventeurs créateurs techniques des innovations brevetées.
 * Reconnaissance paternité intellectuelle et droits moraux sur inventions.
 * 
 * DROITS CRÉATEURS :
 * =================
 * 👨‍🔬 INVENTEUR → Personne physique créatrice technique innovation
 * 🌍 MULTI-PAYS → Nationalités multiples selon mobilité internationale
 * 📧 CONTACT → Communication directe pour notifications et droits
 * ⚖️ PATERNITÉ → Droits moraux inaliénables sur création
 * 
 * VALIDATIONS CRÉATEURS :
 * ======================
 * ✅ Nom obligatoire (identification créateur)
 * ✅ Email validé (communications droits)
 * ✅ Relations pays nationalités
 * ✅ Cohérence données personnelles
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO inventeur complet avec pays nationalités pour reconnaissance créateur.
/// Personne physique créatrice technique avec droits moraux sur invention.
/// Inclut relations géographiques pour contexte international création.
/// </summary>
public class InventeurDto
{
    /// <summary>Identifiant unique inventeur système StartingBloch.</summary>
    public int Id { get; set; }
    
    /// <summary>Nom inventeur OBLIGATOIRE - identification créateur technique.</summary>
    public string Nom { get; set; } = string.Empty;
    
    /// <summary>Prénom inventeur optionnel pour personnalisation reconnaissance.</summary>
    public string? Prenom { get; set; }
    
    /// <summary>Email inventeur optionnel pour communications droits moraux.</summary>
    public string? Email { get; set; }
    
    /// <summary>Liste pays nationalités inventeur pour contexte international.</summary>
    public List<PaysDto> Pays { get; set; } = new();
}

/// <summary>
/// DTO création nouvel inventeur avec validations identification strictes.
/// Assure reconnaissance appropriée créateur et qualité données paternité.
/// </summary>
public class CreateInventeurDto
{
    /// <summary>Nom inventeur OBLIGATOIRE - créateur technique innovation.</summary>
    [Required(ErrorMessage = "Le nom est requis")]
    [StringLength(100, ErrorMessage = "Le nom ne peut pas dépasser 100 caractères")]
    public string Nom { get; set; } = string.Empty;

    /// <summary>Prénom inventeur optionnel pour identification complète.</summary>
    [StringLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères")]
    public string? Prenom { get; set; }

    /// <summary>Email inventeur optionnel avec validation format.</summary>
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? Email { get; set; }
}

/// <summary>
/// DTO modification inventeur existant préservant droits reconnaissance.
/// Maintient contraintes identification pour continuité paternité.
/// </summary>
public class UpdateInventeurDto
{
    /// <summary>Nom inventeur OBLIGATOIRE maintenu pour reconnaissance continue.</summary>
    [Required(ErrorMessage = "Le nom est requis")]
    [StringLength(100, ErrorMessage = "Le nom ne peut pas dépasser 100 caractères")]
    public string Nom { get; set; } = string.Empty;

    /// <summary>Prénom inventeur modifiable pour corrections identification.</summary>
    [StringLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères")]
    public string? Prenom { get; set; }

    /// <summary>Email inventeur modifiable avec validation format maintenue.</summary>
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? Email { get; set; }
}
