const db = require('../models');
const Pays = db.Pays;
const Op = db.Sequelize.Op;

const PaysController = {
  // Création d'un nouveau pays
  createPays: async (req, res) => {
    // Validation de la requête
    if (!req.body.code || !req.body.alpha2 || !req.body.alpha3 || !req.body.nom_en_gb || !req.body.nom_fr_fr) {
      return res.status(400).json({ message: "Les champs code, alpha2, alpha3, nom_en_gb et nom_fr_fr sont obligatoires!" });
    }

    const pays = {
      code: req.body.code,
      alpha2: req.body.alpha2,
      alpha3: req.body.alpha3,
      nom_en_gb: req.body.nom_en_gb,
      nom_fr_fr: req.body.nom_fr_fr
    };

    try {
      const data = await Pays.create(pays);
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message || "Une erreur est survenue lors de la création du pays." });
    }
  },

  // Récupération de tous les pays (avec possibilité de filtrer par nom)
  getAllPays: async (req, res) => {
    const nom = req.query.nom;
    const condition = nom ? { nom_fr_fr: { [Op.like]: `%${nom}%` } } : null;
    try {
      // Modifié pour éviter les erreurs de jointure avec NumeroPays
      const data = await Pays.findAll({
        where: condition,
        // Retirer les associations problématiques temporairement
        // include: [
        //   { model: db.NumeroPays },
        //   { model: db.Titulaire },
        //   { model: db.Deposant },
        //   { model: db.Inventeur },
        //   { model: db.Statuts }
        // ]
      });
      return res.status(200).json({ data });
    } catch (err) {
      console.error("Erreur lors de la récupération des pays:", err);
      return res.status(500).json({ message: err.message || "Une erreur est survenue lors de la récupération des pays." });
    }
  },

  // Récupération d'un pays par son identifiant
  getPaysById: async (req, res) => {
    const id = req.params.id;
    try {
      const data = await Pays.findByPk(id, {
        // Retirer les associations problématiques temporairement
        // include: [
        //   { model: db.NumeroPays },
        //   { model: db.Titulaire },
        //   { model: db.Deposant },
        //   { model: db.Inventeur },
        //   { model: db.Statuts }
        // ]
      });
      if (!data) {
        return res.status(404).json({ message: `Impossible de trouver le pays avec id=${id}.` });
      }
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erreur lors de la récupération du pays:", err);
      return res.status(500).json({ message: "Erreur lors de la récupération du pays avec id=" + id });
    }
  },

  // Mise à jour d'un pays par son identifiant
  updatePays: async (req, res) => {
    const id = req.params.id;
    try {
      const [num] = await Pays.update(req.body, { where: { id: id } });
      if (num === 1) {
        return res.status(200).json({ message: "Le pays a été mis à jour avec succès." });
      } else {
        return res.status(400).json({ message: `Impossible de mettre à jour le pays avec id=${id}. Peut-être que le pays n'a pas été trouvé ou req.body est vide!` });
      }
    } catch (err) {
      return res.status(500).json({ message: "Erreur lors de la mise à jour du pays avec id=" + id });
    }
  },

  // Suppression d'un pays par son identifiant
  deletePays: async (req, res) => {
    const id = req.params.id;
    try {
      const num = await Pays.destroy({ where: { id: id } });
      if (num === 1) {
        return res.status(200).json({ message: "Le pays a été supprimé avec succès!" });
      } else {
        return res.status(400).json({ message: `Impossible de supprimer le pays avec id=${id}. Peut-être que le pays n'a pas été trouvé!` });
      }
    } catch (err) {
      return res.status(500).json({ message: "Impossible de supprimer le pays avec id=" + id });
    }
  }
};

module.exports = PaysController;
