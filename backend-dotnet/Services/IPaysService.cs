/*
 * ================================================================================================
 * INTERFACE SERVICE PAYS - CONTRAT GESTION RÉFÉRENTIEL GÉOGRAPHIQUE INTERNATIONAL
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service pays StartingBloch définissant gestion référentiel géographique.
 * Spécification méthodes administration pays et juridictions propriété intellectuelle.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 🌍 CONSULTATION → Récupération liste complète pays référentiel
 * 🔍 DÉTAIL → Accès pays spécifique avec informations complètes
 * ➕ CRÉATION → Nouveau pays avec validation codes internationaux
 * 🗑️ SUPPRESSION → Suppression pays avec vérification dépendances
 * 📋 RÉFÉRENTIEL → Gestion base pays selon standards internationaux
 * 
 * DONNÉES PAYS GÉRÉES :
 * ====================
 * 🌍 GÉOGRAPHIE → Nom pays multilingue (français, anglais, local)
 * 🏷️ CODES → ISO 3166-1 alpha-2/alpha-3, codes numériques
 * ⚖️ JURIDICTION → Autorité propriété intellectuelle nationale
 * 🌐 RÉGION → Classification géographique et économique
 * 🕐 AUDIT → Dates création, modification, historique
 * 
 * STANDARDS INTERNATIONAUX :
 * =========================
 * ✅ ISO 3166-1 → Codes pays alpha-2/alpha-3 officiels
 * ✅ OMPI → Organisation Mondiale Propriété Intellectuelle
 * ✅ PCT → Patent Cooperation Treaty juridictions
 * ✅ Convention Paris → Unions protection industrielle
 * ✅ ONU → Classification géographique officielle
 * 
 * VALIDATION RÉFÉRENTIEL :
 * =======================
 * ✅ Unicité codes ISO obligatoire
 * ✅ Validation format codes selon standards
 * ✅ Contrôle cohérence noms multilingues
 * ✅ Vérification existence juridictions PI
 * 
 * INTÉGRITÉ DONNÉES :
 * ==================
 * ✅ Relations référentielles avec entités métier
 * ✅ Contraintes suppression si utilisation active
 * ✅ Validation existence avant assignations
 * ✅ Audit trail modifications référentiel
 * 
 * CONFORMITÉ ARCHITECTURALE :
 * ==========================
 * ✅ Pattern Repository avec abstraction complète
 * ✅ Injection dépendances via interface
 * ✅ Séparation responsabilités métier/données
 * ✅ Testabilité maximale via contrats
 * ✅ Évolutivité garantie par découplage
 * 
 * ================================================================================================
 */

using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Interface service métier gestion référentiel pays et juridictions internationales.
/// Contrat complet administration géographique selon standards internationaux.
/// </summary>
public interface IPaysService
{
    /// <summary>
    /// Récupère liste complète pays référentiel avec informations standardisées.
    /// Chargement optimisé référentiel géographique selon normes ISO 3166-1.
    /// </summary>
    /// <returns>Liste complète pays avec codes ISO et juridictions</returns>
    Task<ApiResponse<List<PaysDto>>> GetPaysAsync();
    
    /// <summary>
    /// Récupère pays spécifique avec informations détaillées complètes.
    /// Chargement optimisé pays avec données géographiques et juridictionnelles.
    /// </summary>
    /// <param name="id">Identifiant unique pays recherché</param>
    /// <returns>Pays détaillé avec codes ISO et juridiction ou erreur</returns>
    Task<ApiResponse<PaysDto>> GetPaysByIdAsync(int id);
    
    /// <summary>
    /// Crée nouveau pays avec validation codes ISO et juridiction.
    /// Contrôle unicité codes internationaux et cohérence référentiel.
    /// </summary>
    /// <param name="createPaysDto">Données création pays avec codes ISO</param>
    /// <returns>Pays créé avec validation codes internationaux</returns>
    Task<ApiResponse<PaysDto>> CreatePaysAsync(CreatePaysDto createPaysDto);
    
    /// <summary>
    /// Supprime pays avec vérification dépendances entités métier.
    /// Contrôle utilisation référentiel avant suppression définitive.
    /// </summary>
    /// <param name="id">Identifiant pays à supprimer du référentiel</param>
    /// <returns>Confirmation succès suppression avec audit</returns>
    Task<ApiResponse<bool>> DeletePaysAsync(int id);
}
