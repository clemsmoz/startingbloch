using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("InformationDepotCabinets")]
public class InformationDepotCabinet
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("information_depot_id")]
    public int InformationDepotId { get; set; }

    [Column("cabinet_id")]
    public int CabinetId { get; set; }

    // Catégorie d'intervention pour cette information de dépôt (Annuité / Procédure)
    [Column("category")]
    public CabinetType Category { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("InformationDepotId")]
    public virtual InformationDepot InformationDepot { get; set; } = null!;

    [ForeignKey("CabinetId")]
    public virtual Cabinet Cabinet { get; set; } = null!;

    public virtual ICollection<InformationDepotCabinetRole> Roles { get; set; } = new List<InformationDepotCabinetRole>();
    public virtual ICollection<InformationDepotCabinetContact> Contacts { get; set; } = new List<InformationDepotCabinetContact>();
}

[Table("InformationDepotCabinetRoles")]
public class InformationDepotCabinetRole
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("information_depot_cabinet_id")]
    public int InformationDepotCabinetId { get; set; }

    // Rôle: premier | deuxieme | troisieme (stocké en texte)
    [MaxLength(50)]
    [Column("role")]
    public string Role { get; set; } = string.Empty;

    [ForeignKey("InformationDepotCabinetId")]
    public virtual InformationDepotCabinet InformationDepotCabinet { get; set; } = null!;
}

[Table("InformationDepotCabinetContacts")]
public class InformationDepotCabinetContact
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("information_depot_cabinet_id")]
    public int InformationDepotCabinetId { get; set; }

    [Column("contact_id")]
    public int ContactId { get; set; }

    [ForeignKey("InformationDepotCabinetId")]
    public virtual InformationDepotCabinet InformationDepotCabinet { get; set; } = null!;

    [ForeignKey("ContactId")]
    public virtual Contact Contact { get; set; } = null!;
}
