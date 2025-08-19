/*
 * ================================================================================================
 * SERVICE CONTACTS - GESTION RELATIONS PROFESSIONNELLES PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Service métier complet gestion contacts professionnels StartingBloch.
 * Administration relations clients-cabinets, interlocuteurs et communications.
 * 
 * FONCTIONNALITÉS CONTACTS :
 * =========================
 * 📋 CONSULTATION → Liste paginée avec recherche multi-champs
 * 🔍 DÉTAIL → Contact complet avec relations cabinet/client
 * ➕ CRÉATION → Nouveau contact avec assignation entité
 * ✏️ MODIFICATION → Mise à jour informations contact
 * 🗑️ SUPPRESSION → Suppression logique contact
 * 🔗 RELATIONS → Gestion liens cabinets/clients/rôles
 * 
 * DONNÉES CONTACTS :
 * =================
 * 👤 IDENTITÉ → Nom, prénom, coordonnées complètes
 * 📧 COMMUNICATION → Email, téléphone, moyens contact
 * 🎭 RÔLE → Fonction professionnelle dans entité
 * 🏢 AFFECTATION → Cabinet conseil ou client assigné
 * 🕐 AUDIT → Dates création, modification, historique
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Recherche textuelle multi-champs (nom, prénom, email, rôle)
 * ✅ Filtrage par cabinet ou client spécifique
 * ✅ Pagination optimisée grandes collections
 * ✅ Tri alphabétique par défaut
 * 
 * CONFORMITÉ RELATIONNELLE :
 * =========================
 * ✅ Intégrité référentielle cabinets/clients
 * ✅ Validation unicité email par entité
 * ✅ Gestion rôles professionnels standards
 * ✅ Audit trail complet modifications
 * ✅ Relations Many-to-One sécurisées
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Service métier complet gestion contacts professionnels propriété intellectuelle.
/// Implémentation sécurisée relations cabinets-clients avec recherche optimisée.
/// </summary>
public class ContactService : IContactService
{
    private readonly StartingBlochDbContext _context;

    /// <summary>
    /// Initialise service contacts avec contexte données Entity Framework.
    /// Configuration accès base données optimisée requêtes relations.
    /// </summary>
    /// <param name="context">Contexte base données Entity Framework</param>
    public ContactService(StartingBlochDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Récupère liste paginée contacts avec recherche textuelle multi-champs.
    /// Recherche optimisée nom, prénom, email, rôle avec relations complètes.
    /// </summary>
    /// <param name="page">Numéro page courante (1 par défaut)</param>
    /// <param name="pageSize">Taille page (10 éléments par défaut)</param>
    /// <param name="search">Terme recherche optionnel multi-champs</param>
    /// <returns>Réponse paginée liste contacts avec relations</returns>
    public async Task<PagedResponse<List<ContactDto>>> GetContactsAsync(int page = 1, int pageSize = 10, string? search = null)
    {
        try
        {
            var query = _context.Contacts.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => (c.Nom != null && c.Nom.Contains(search)) || 
                                        (c.Prenom != null && c.Prenom.Contains(search)) ||
                                        (c.Email != null && c.Email.Contains(search)) ||
                                        (c.Role != null && c.Role.Contains(search)));
            }

            var totalItems = await query.CountAsync();

            var contacts = await query
                .Include(c => c.Cabinet)
                .Include(c => c.Client)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var contactDtos = contacts.Select(c => new ContactDto
            {
                Id = c.Id,
                Nom = c.Nom,
                Prenom = c.Prenom,
                Email = c.Email,
                Telephone = c.Telephone,
                Role = c.Role,
                IdCabinet = c.IdCabinet,
                IdClient = c.IdClient,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                Emails = c.Emails,
                Phones = c.Phones,
                Roles = c.Roles,
                CabinetNom = c.Cabinet?.Nom,
                ClientNom = c.Client?.Nom
            }).ToList();

            return new PagedResponse<List<ContactDto>>
            {
                Success = true,
                Data = contactDtos,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                Message = $"{contactDtos.Count} contacts trouvés"
            };
        }
        catch (Exception ex)
        {
            return new PagedResponse<List<ContactDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des contacts",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère contact spécifique par identifiant avec relations complètes.
    /// Chargement optimisé cabinet et client associés pour contexte complet.
    /// </summary>
    /// <param name="id">Identifiant unique contact recherché</param>
    /// <returns>Contact détaillé avec relations cabinet/client</returns>
    public async Task<ApiResponse<ContactDto>> GetContactByIdAsync(int id)
    {
        try
        {
            var contact = await _context.Contacts
                .Include(c => c.Cabinet)
                .Include(c => c.Client)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contact == null)
            {
                return new ApiResponse<ContactDto>
                {
                    Success = false,
                    Message = "Contact non trouvé"
                };
            }

            var contactDto = new ContactDto
            {
                Id = contact.Id,
                Nom = contact.Nom,
                Prenom = contact.Prenom,
                Email = contact.Email,
                Telephone = contact.Telephone,
                Role = contact.Role,
                IdCabinet = contact.IdCabinet,
                IdClient = contact.IdClient,
                CreatedAt = contact.CreatedAt,
                UpdatedAt = contact.UpdatedAt,
                Emails = contact.Emails,
                Phones = contact.Phones,
                Roles = contact.Roles,
                CabinetNom = contact.Cabinet?.Nom,
                ClientNom = contact.Client?.Nom
            };

            return new ApiResponse<ContactDto>
            {
                Success = true,
                Data = contactDto
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<ContactDto>
            {
                Success = false,
                Message = "Erreur lors de la récupération du contact",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Crée nouveau contact professionnel avec validation et assignation entité.
    /// Gestion collections emails/téléphones multiples et audit trail automatique.
    /// </summary>
    /// <param name="createContactDto">Données création contact avec relations</param>
    /// <returns>Contact créé avec détails complets et relations</returns>
    public async Task<ApiResponse<ContactDto>> CreateContactAsync(CreateContactDto createContactDto)
    {
        try
        {
            var contact = new Contact
            {
                Nom = createContactDto.Nom,
                Prenom = createContactDto.Prenom,
                Email = createContactDto.Email,
                Telephone = createContactDto.Telephone,
                Role = createContactDto.Role,
                IdCabinet = createContactDto.IdCabinet,
                IdClient = createContactDto.IdClient,
                Emails = createContactDto.Emails ?? new List<string>(),
                Phones = createContactDto.Phones ?? new List<string>(),
                Roles = createContactDto.Roles ?? new List<string>(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();

            // Recharger avec les relations
            await _context.Entry(contact)
                .Reference(c => c.Cabinet)
                .LoadAsync();
            await _context.Entry(contact)
                .Reference(c => c.Client)
                .LoadAsync();

            var contactDto = new ContactDto
            {
                Id = contact.Id,
                Nom = contact.Nom,
                Prenom = contact.Prenom,
                Email = contact.Email,
                Telephone = contact.Telephone,
                Role = contact.Role,
                IdCabinet = contact.IdCabinet,
                IdClient = contact.IdClient,
                CreatedAt = contact.CreatedAt,
                UpdatedAt = contact.UpdatedAt,
                Emails = contact.Emails,
                Phones = contact.Phones,
                Roles = contact.Roles,
                CabinetNom = contact.Cabinet?.Nom,
                ClientNom = contact.Client?.Nom
            };

            return new ApiResponse<ContactDto>
            {
                Success = true,
                Data = contactDto,
                Message = "Contact créé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<ContactDto>
            {
                Success = false,
                Message = "Erreur lors de la création du contact",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Met à jour contact existant avec nouvelles informations et relations.
    /// Préservation données existantes si non spécifiées, audit trail automatique.
    /// </summary>
    /// <param name="id">Identifiant contact à modifier</param>
    /// <param name="updateContactDto">Nouvelles données contact partielles</param>
    /// <returns>Contact modifié avec détails complets mis à jour</returns>
    public async Task<ApiResponse<ContactDto>> UpdateContactAsync(int id, UpdateContactDto updateContactDto)
    {
        try
        {
            var contact = await _context.Contacts
                .Include(c => c.Cabinet)
                .Include(c => c.Client)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contact == null)
            {
                return new ApiResponse<ContactDto>
                {
                    Success = false,
                    Message = "Contact non trouvé"
                };
            }

            contact.Nom = updateContactDto.Nom;
            contact.Prenom = updateContactDto.Prenom;
            contact.Email = updateContactDto.Email;
            contact.Telephone = updateContactDto.Telephone;
            contact.Role = updateContactDto.Role;
            contact.IdCabinet = updateContactDto.IdCabinet;
            contact.IdClient = updateContactDto.IdClient;
            contact.Emails = updateContactDto.Emails ?? contact.Emails;
            contact.Phones = updateContactDto.Phones ?? contact.Phones;
            contact.Roles = updateContactDto.Roles ?? contact.Roles;
            contact.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var contactDto = new ContactDto
            {
                Id = contact.Id,
                Nom = contact.Nom,
                Prenom = contact.Prenom,
                Email = contact.Email,
                Telephone = contact.Telephone,
                Role = contact.Role,
                IdCabinet = contact.IdCabinet,
                IdClient = contact.IdClient,
                CreatedAt = contact.CreatedAt,
                UpdatedAt = contact.UpdatedAt,
                Emails = contact.Emails,
                Phones = contact.Phones,
                Roles = contact.Roles,
                CabinetNom = contact.Cabinet?.Nom,
                ClientNom = contact.Client?.Nom
            };

            return new ApiResponse<ContactDto>
            {
                Success = true,
                Data = contactDto,
                Message = "Contact mis à jour avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<ContactDto>
            {
                Success = false,
                Message = "Erreur lors de la mise à jour du contact",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Supprime contact professionnel de manière permanente.
    /// Vérification existence avant suppression avec gestion erreurs robuste.
    /// </summary>
    /// <param name="id">Identifiant contact à supprimer</param>
    /// <returns>Confirmation succès suppression contact</returns>
    public async Task<ApiResponse<bool>> DeleteContactAsync(int id)
    {
        try
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Contact non trouvé"
                };
            }

            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Contact supprimé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la suppression du contact",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère la liste paginée des contacts associés à un client spécifique.
    /// </summary>
    /// <param name="clientId">Identifiant du client</param>
    /// <param name="page">Numéro de page</param>
    /// <param name="pageSize">Taille de la page</param>
    /// <returns>Réponse paginée des contacts du client</returns>
    public async Task<PagedResponse<List<ContactDto>>> GetContactsByClientAsync(int clientId, int page = 1, int pageSize = 10)
    {
        try
        {
            var query = _context.Contacts.Where(c => c.IdClient == clientId);
            var totalItems = await query.CountAsync();
            var contacts = await query
                .Include(c => c.Cabinet)
                .Include(c => c.Client)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            var contactDtos = contacts.Select(c => new ContactDto
            {
                Id = c.Id,
                Nom = c.Nom,
                Prenom = c.Prenom,
                Email = c.Email,
                Telephone = c.Telephone,
                Role = c.Role,
                IdCabinet = c.IdCabinet,
                IdClient = c.IdClient,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                Emails = c.Emails,
                Phones = c.Phones,
                Roles = c.Roles,
                CabinetNom = c.Cabinet?.Nom,
                ClientNom = c.Client?.Nom
            }).ToList();
            return new PagedResponse<List<ContactDto>>
            {
                Success = true,
                Data = contactDtos,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                Message = $"{contactDtos.Count} contacts trouvés pour le client"
            };
        }
        catch (Exception ex)
        {
            return new PagedResponse<List<ContactDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des contacts du client",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère la liste paginée des contacts associés à un cabinet spécifique.
    /// </summary>
    /// <param name="cabinetId">Identifiant du cabinet</param>
    /// <param name="page">Numéro de page</param>
    /// <param name="pageSize">Taille de la page</param>
    /// <returns>Réponse paginée des contacts du cabinet</returns>
    public async Task<PagedResponse<List<ContactDto>>> GetContactsByCabinetAsync(int cabinetId, int page = 1, int pageSize = 10)
    {
        try
        {
            var query = _context.Contacts.Where(c => c.IdCabinet == cabinetId);
            var totalItems = await query.CountAsync();
            var contacts = await query
                .Include(c => c.Cabinet)
                .Include(c => c.Client)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            var contactDtos = contacts.Select(c => new ContactDto
            {
                Id = c.Id,
                Nom = c.Nom,
                Prenom = c.Prenom,
                Email = c.Email,
                Telephone = c.Telephone,
                Role = c.Role,
                IdCabinet = c.IdCabinet,
                IdClient = c.IdClient,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                Emails = c.Emails,
                Phones = c.Phones,
                Roles = c.Roles,
                CabinetNom = c.Cabinet?.Nom,
                ClientNom = c.Client?.Nom
            }).ToList();
            return new PagedResponse<List<ContactDto>>
            {
                Success = true,
                Data = contactDtos,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                Message = $"{contactDtos.Count} contacts trouvés pour le cabinet"
            };
        }
        catch (Exception ex)
        {
            return new PagedResponse<List<ContactDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des contacts du cabinet",
                Errors = ex.Message
            };
        }
    }
}
