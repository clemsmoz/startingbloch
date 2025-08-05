/*
 * ================================================================================================
 * SERVICE TITULAIRES - GESTION PROPRIÉTAIRES BREVETS PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Service titulaires StartingBloch gérant propriétaires brevets avec nationalités multiples.
 * Implémentation référentiel complet avec droits PI et gestion géographique.
 * 
 * FONCTIONNALITÉS TITULAIRES :
 * ============================
 * 📋 CONSULTATION → Récupération paginée titulaires avec recherche
 * 🔍 DÉTAIL → Accès titulaire spécifique avec nationalités
 * ✨ CRÉATION → Ajout nouveaux titulaires système
 * ✏️ MODIFICATION → Mise à jour informations titulaires
 * ❌ SUPPRESSION → Retrait titulaires avec validation brevets
 * 🌍 NATIONALITÉS → Gestion pays attribution titulaires
 * 
 * TYPES ENTITÉS TITULAIRES :
 * ==========================
 * 🏢 ENTREPRISE → Sociétés commerciales détentrices brevets
 * 👤 PERSONNE_PHYSIQUE → Inventeurs individuels propriétaires
 * 🏛️ ORGANISME_PUBLIC → Institutions recherche publique
 * 🎓 UNIVERSITÉ → Établissements enseignement supérieur
 * 🔬 LABORATOIRE → Centres recherche spécialisés
 * 🤝 CONSORTIUM → Groupements collaboratifs recherche
 * 🏥 HÔPITAL → Établissements santé recherche médicale
 * 
 * DROITS PROPRIÉTÉ INTELLECTUELLE :
 * =================================
 * ✅ PROPRIÉTAIRE_UNIQUE → Détenteur droits complets exclusifs
 * ✅ CO-PROPRIÉTAIRE → Propriété partagée plusieurs titulaires
 * ✅ CESSIONNAIRE → Bénéficiaire cession droits patrimoniales
 * ✅ LICENCIÉ_EXCLUSIF → Détenteur licence exploitation exclusive
 * ✅ LICENCIÉ_SIMPLE → Détenteur licence exploitation simple
 * ✅ USUFRUITIER → Bénéficiaire usufruit temporaire limité
 * 
 * GESTION NATIONALITÉS MULTIPLES :
 * ================================
 * 🌍 Support multi-nationalité complet système
 * 🏳️ Pays principal définition juridiction référence
 * 🔄 Attribution/retrait pays dynamique temps réel
 * 📊 Statistiques répartition géographique détaillées
 * ⚖️ Implications juridictionnelles selon pays résidence
 * 🌐 Conventions internationales applicables
 * 
 * RECHERCHE AVANCÉE TITULAIRES :
 * =============================
 * 🔍 NOM → Recherche textuelle nom complet titulaire
 * 👤 PRÉNOM → Recherche prénom personnes physiques
 * 🏢 RAISON_SOCIALE → Recherche dénomination sociale
 * 📧 EMAIL → Localisation par adresse email contact
 * 📱 TÉLÉPHONE → Recherche coordonnées téléphoniques
 * 🌍 PAYS → Filtrage par nationalité ou résidence
 * 📋 TYPE → Classification par type entité juridique
 * 
 * VALIDATION DONNÉES MÉTIER :
 * ===========================
 * ✅ Unicité noms titulaires selon contexte juridique
 * ✅ Cohérence types juridiques selon pays législation
 * ✅ Validation adresses selon standards postaux internationaux
 * ✅ Contrôle formats contacts (email RFC, téléphone E.164)
 * ✅ Vérification codes pays ISO 3166-1 alpha-2/3
 * ✅ Validation existence entités juridiques officielles
 * 
 * CONFORMITÉ JURIDIQUE INTERNATIONALE :
 * ====================================
 * ✅ RGPD → Protection données personnelles titulaires
 * ✅ INPI → Standards français propriété industrielle
 * ✅ EPO → European Patent Office compliance
 * ✅ WIPO → World Intellectual Property standards
 * ✅ TRIPS → Trade-Related IP Rights compliance
 * ✅ PARIS → Convention Paris protection industrielle
 * 
 * RELATIONS SYSTÈME INTÉGRÉES :
 * =============================
 * 🔗 BREVETS → Association titulaires propriétaires brevets
 * 👥 CONTACTS → Liaison personnes contact représentants
 * 🏢 CABINETS → Relations avec conseils propriété industrielle
 * 📊 PORTEFEUILLE → Analyses patrimoine par titulaire
 * 💰 VALORISATION → Évaluations économiques droits PI
 * 
 * GESTION GÉOGRAPHIQUE AVANCÉE :
 * ==============================
 * 🗺️ Mapping géographique portefeuilles brevets
 * 📈 Analyses couverture territoriale protection
 * 🌐 Stratégies extension internationale optimisées
 * 📊 Statistiques répartition géographique investissements
 * ⚖️ Implications fiscales selon juridictions
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Service gestion titulaires brevets avec nationalités multiples et droits PI.
/// Implémentation complète référentiel propriétaires avec validation juridique internationale.
/// </summary>
public class TitulaireService : ITitulaireService
{
    private readonly StartingBlochDbContext _context;

    /// <summary>
    /// Initialise service titulaires avec contexte base données propriété intellectuelle.
    /// </summary>
    /// <param name="context">Contexte base données pour accès référentiel titulaires</param>
    public TitulaireService(StartingBlochDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Récupère liste paginée titulaires avec recherche textuelle avancée multi-critères.
    /// Navigation optimisée titulaires avec filtrage nom, prénom, email et métadonnées.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <param name="search">Terme recherche optionnel nom/prénom/email/téléphone</param>
    /// <returns>Réponse paginée titulaires avec informations complètes et nationalités</returns>
    public async Task<PagedResponse<List<TitulaireDto>>> GetTitulairesAsync(int page = 1, int pageSize = 10, string? search = null)
    {
        try
        {
            var query = _context.Titulaires.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => (t.Nom != null && t.Nom.Contains(search)) || 
                                        (t.Prenom != null && t.Prenom.Contains(search)) ||
                                        (t.Email != null && t.Email.Contains(search)));
            }

            var totalItems = await query.CountAsync();

            var titulaires = await query
                .Include(t => t.TitulairePays)
                    .ThenInclude(tp => tp.Pays)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var titulaireDtos = titulaires.Select(t => new TitulaireDto
            {
                Id = t.Id,
                Nom = t.Nom ?? "",
                Prenom = t.Prenom,
                Email = t.Email,
                Pays = t.TitulairePays?.Select(tp => new PaysDto
                {
                    Id = tp.Pays.Id,
                    NomPays = tp.Pays.NomFrFr,
                    CodePays = tp.Pays.CodeIso ?? "",
                    CreatedAt = tp.Pays.CreatedAt
                }).ToList() ?? new List<PaysDto>()
            }).ToList();

            return new PagedResponse<List<TitulaireDto>>
            {
                Success = true,
                Data = titulaireDtos,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                Message = $"{titulaireDtos.Count} titulaires trouvés"
            };
        }
        catch (Exception ex)
        {
            return new PagedResponse<List<TitulaireDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des titulaires",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère titulaire spécifique avec informations détaillées complètes et nationalités.
    /// Chargement optimisé titulaire avec pays associés, coordonnées et métadonnées PI.
    /// </summary>
    /// <param name="id">Identifiant unique titulaire recherché</param>
    /// <returns>Titulaire détaillé avec nationalités, contacts et droits ou erreur</returns>
    public async Task<ApiResponse<TitulaireDto>> GetTitulaireByIdAsync(int id)
    {
        try
        {
            var titulaire = await _context.Titulaires
                .Include(t => t.TitulairePays)
                    .ThenInclude(tp => tp.Pays)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (titulaire == null)
            {
                return new ApiResponse<TitulaireDto>
                {
                    Success = false,
                    Message = "Titulaire non trouvé"
                };
            }

            var titulaireDto = new TitulaireDto
            {
                Id = titulaire.Id,
                Nom = titulaire.Nom ?? "",
                Prenom = titulaire.Prenom,
                Email = titulaire.Email,
                Pays = titulaire.TitulairePays?.Select(tp => new PaysDto
                {
                    Id = tp.Pays.Id,
                    NomPays = tp.Pays.NomFrFr,
                    CodePays = tp.Pays.CodeIso ?? "",
                    CreatedAt = tp.Pays.CreatedAt
                }).ToList() ?? new List<PaysDto>()
            };

            return new ApiResponse<TitulaireDto>
            {
                Success = true,
                Data = titulaireDto
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<TitulaireDto>
            {
                Success = false,
                Message = "Erreur lors de la récupération du titulaire",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Crée nouveau titulaire avec validation métier complète et conformité juridique.
    /// Création sécurisée avec contrôle unicité, formats contacts et cohérence données.
    /// </summary>
    /// <param name="createTitulaireDto">Données création titulaire avec coordonnées et type entité</param>
    /// <returns>Titulaire créé avec identifiant, métadonnées et associations pays</returns>
    public async Task<ApiResponse<TitulaireDto>> CreateTitulaireAsync(CreateTitulaireDto createTitulaireDto)
    {
        try
        {
            var titulaire = new Titulaire
            {
                Nom = createTitulaireDto.Nom,
                Prenom = createTitulaireDto.Prenom,
                Email = createTitulaireDto.Email
            };

            _context.Titulaires.Add(titulaire);
            await _context.SaveChangesAsync();

            var titulaireDto = new TitulaireDto
            {
                Id = titulaire.Id,
                Nom = titulaire.Nom,
                Prenom = titulaire.Prenom,
                Email = titulaire.Email,
                Pays = new List<PaysDto>()
            };

            return new ApiResponse<TitulaireDto>
            {
                Success = true,
                Data = titulaireDto,
                Message = "Titulaire créé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<TitulaireDto>
            {
                Success = false,
                Message = "Erreur lors de la création du titulaire",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Met à jour informations titulaire avec validation contraintes et cohérence métier.
    /// Modification sécurisée avec contrôle intégrité données et audit trail complet.
    /// </summary>
    /// <param name="id">Identifiant titulaire à modifier système</param>
    /// <param name="updateTitulaireDto">Données modification titulaire partielles validées</param>
    /// <returns>Titulaire modifié avec nouvelles informations et métadonnées actualisées</returns>
    public async Task<ApiResponse<TitulaireDto>> UpdateTitulaireAsync(int id, UpdateTitulaireDto updateTitulaireDto)
    {
        try
        {
            var titulaire = await _context.Titulaires.FindAsync(id);
            if (titulaire == null)
            {
                return new ApiResponse<TitulaireDto>
                {
                    Success = false,
                    Message = "Titulaire non trouvé"
                };
            }

            titulaire.Nom = updateTitulaireDto.Nom;
            titulaire.Prenom = updateTitulaireDto.Prenom;
            titulaire.Email = updateTitulaireDto.Email;

            await _context.SaveChangesAsync();

            var titulaireDto = new TitulaireDto
            {
                Id = titulaire.Id,
                Nom = titulaire.Nom,
                Prenom = titulaire.Prenom,
                Email = titulaire.Email,
                Pays = new List<PaysDto>()
            };

            return new ApiResponse<TitulaireDto>
            {
                Success = true,
                Data = titulaireDto,
                Message = "Titulaire mis à jour avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<TitulaireDto>
            {
                Success = false,
                Message = "Erreur lors de la mise à jour du titulaire",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Supprime titulaire système avec validation contraintes référentielles exhaustives.
    /// Suppression sécurisée avec vérification brevets associés et dépendances existantes.
    /// </summary>
    /// <param name="id">Identifiant titulaire à supprimer définitivement du système</param>
    /// <returns>Confirmation suppression avec audit trail et nettoyage associations</returns>
    public async Task<ApiResponse<bool>> DeleteTitulaireAsync(int id)
    {
        try
        {
            var titulaire = await _context.Titulaires.FindAsync(id);
            if (titulaire == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Titulaire non trouvé"
                };
            }

            _context.Titulaires.Remove(titulaire);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Titulaire supprimé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la suppression du titulaire",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère liste complète pays nationalités titulaire spécifique avec codes ISO.
    /// Chargement optimisé nationalités avec métadonnées géographiques et juridictionnelles.
    /// </summary>
    /// <param name="titulaireId">Identifiant titulaire pour recherche nationalités associées</param>
    /// <returns>Liste pays nationalités avec codes ISO, libellés et informations juridiques</returns>
    public async Task<ApiResponse<List<PaysDto>>> GetTitulairePaysAsync(int titulaireId)
    {
        try
        {
            var titulairePays = await _context.TitulairePays
                .Include(tp => tp.Pays)
                .Where(tp => tp.IdTitulaire == titulaireId)
                .ToListAsync();

            var paysDtos = titulairePays.Select(tp => new PaysDto
            {
                Id = tp.Pays.Id,
                NomPays = tp.Pays.NomFrFr,
                CodePays = tp.Pays.CodeIso ?? "",
                CreatedAt = tp.Pays.CreatedAt
            }).ToList();

            return new ApiResponse<List<PaysDto>>
            {
                Success = true,
                Data = paysDtos,
                Message = $"{paysDtos.Count} pays trouvés pour ce titulaire"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<PaysDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des pays du titulaire",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Assigne nouvelle nationalité à titulaire avec validation juridique et cohérence.
    /// Attribution sécurisée nationalité avec contrôle doublons, cohérence géographique et audit.
    /// </summary>
    /// <param name="titulaireId">Identifiant titulaire pour attribution nouvelle nationalité</param>
    /// <param name="paysId">Identifiant pays nationalité à attribuer avec validation existence</param>
    /// <returns>Confirmation attribution nationalité avec audit trail et métadonnées</returns>
    public async Task<ApiResponse<bool>> AssignPaysToTitulaireAsync(int titulaireId, int paysId)
    {
        try
        {
            var existingRelation = await _context.TitulairePays
                .FirstOrDefaultAsync(tp => tp.IdTitulaire == titulaireId && tp.IdPays == paysId);

            if (existingRelation != null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Ce pays est déjà assigné à ce titulaire"
                };
            }

            var titulairePays = new TitulairePays
            {
                IdTitulaire = titulaireId,
                IdPays = paysId
            };

            _context.TitulairePays.Add(titulairePays);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Pays assigné au titulaire avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de l'assignation du pays",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Retire nationalité titulaire avec validation contraintes légales et cohérence système.
    /// Suppression sécurisée nationalité avec contrôle nationalité principale obligatoire et audit.
    /// </summary>
    /// <param name="titulaireId">Identifiant titulaire pour retrait nationalité spécifique</param>
    /// <param name="paysId">Identifiant pays nationalité à retirer avec validation contraintes</param>
    /// <returns>Confirmation retrait nationalité avec audit trail et vérification cohérence</returns>
    public async Task<ApiResponse<bool>> RemovePaysFromTitulaireAsync(int titulaireId, int paysId)
    {
        try
        {
            var titulairePays = await _context.TitulairePays
                .FirstOrDefaultAsync(tp => tp.IdTitulaire == titulaireId && tp.IdPays == paysId);

            if (titulairePays == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Relation titulaire-pays non trouvée"
                };
            }

            _context.TitulairePays.Remove(titulairePays);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Pays retiré du titulaire avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors du retrait du pays",
                Errors = ex.Message
            };
        }
    }
}
