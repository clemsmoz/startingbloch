const db = require('../models');
const Titulaire = db.Titulaire;
const Op = db.Sequelize.Op;

const TitulaireController = {
  // Création d'un nouveau titulaire avec validation des champs obligatoires
  createTitulaire: async (req, res) => {
    if (!req.body.nom_titulaire || !req.body.prenom_titulaire || !req.body.email_titulaire || !req.body.telephone_titulaire) {
      return res.status(400).json({ message: "Les champs nom, prénom, email et téléphone sont obligatoires!" });
    }

    const titulaire = {
      nom_titulaire: req.body.nom_titulaire,
      prenom_titulaire: req.body.prenom_titulaire,
      email_titulaire: req.body.email_titulaire,
      telephone_titulaire: req.body.telephone_titulaire
    };

    try {
      const result = await Titulaire.create(titulaire);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message || "Une erreur est survenue lors de la création du titulaire." });
    }
  },

  // Récupération de tous les titulaires, avec filtrage optionnel par nom
  getAllTitulaires: async (req, res) => {
    const nom = req.query.nom;
    const condition = nom ? { nom_titulaire: { [Op.like]: `%${nom}%` } } : null;
    try {
      const results = await Titulaire.findAll({
        where: condition,
        include: [
          { model: db.Brevet },
          { model: db.Pays }
        ]
      });
      return res.status(200).json({ data: results });
    } catch (error) {
      return res.status(500).json({ message: error.message || "Une erreur est survenue lors de la récupération des titulaires." });
    }
  },

  // Récupération d'un titulaire par son identifiant
  getTitulaireById: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await Titulaire.findByPk(id, {
        include: [
          { model: db.Brevet },
          { model: db.Pays }
        ]
      });
      if (!result) {
        return res.status(404).json({ message: `Impossible de trouver le titulaire avec id=${id}.` });
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la récupération du titulaire avec id=" + id });
    }
  },

  // Mise à jour d'un titulaire par son identifiant
  updateTitulaire: async (req, res) => {
    const id = req.params.id;
    try {
      const [updated] = await Titulaire.update(req.body, { where: { id: id } });
      if (updated === 1) {
        const updatedTitulaire = await Titulaire.findByPk(id);
        return res.status(200).json(updatedTitulaire);
      } else {
        return res.status(400).json({ message: `Impossible de mettre à jour le titulaire avec id=${id}. Peut-être que le titulaire n'a pas été trouvé ou req.body est vide!` });
      }
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la mise à jour du titulaire avec id=" + id });
    }
  },

  // Suppression d'un titulaire par son identifiant
  deleteTitulaire: async (req, res) => {
    const id = req.params.id;
    try {
      const deleted = await Titulaire.destroy({ where: { id: id } });
      if (deleted === 1) {
        return res.status(200).json({ message: "Le titulaire a été supprimé avec succès!" });
      } else {
        return res.status(400).json({ message: `Impossible de supprimer le titulaire avec id=${id}. Peut-être que le titulaire n'a pas été trouvé!` });
      }
    } catch (error) {
      return res.status(500).json({ message: "Impossible de supprimer le titulaire avec id=" + id });
    }
  }
};

module.exports = TitulaireController;
