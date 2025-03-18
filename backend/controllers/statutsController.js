const db = require('../models');
const Statuts = db.Statuts;
const Op = db.Sequelize.Op;

const StatutsController = {
  // Création d'un nouveau statut
  createStatuts: async (req, res) => {
    const statutData = {
      statuts: req.body.statuts,
      description: req.body.description
    };

    try {
      const data = await Statuts.create(statutData);
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message || "Une erreur est survenue lors de la création du statut." });
    }
  },

  // Récupération de tous les statuts (filtrage optionnel par nom de statut)
  getAllStatuts: async (req, res) => {
    const statut = req.query.statut;
    const condition = statut ? { statuts: { [Op.like]: `%${statut}%` } } : null;
    try {
      // Modifié pour éviter les erreurs de jointure avec NumeroPays
      const data = await Statuts.findAll({
        where: condition,
        // Retirer les associations problématiques temporairement
        // include: [
        //   { model: db.NumeroPays },
        //   { model: db.Pays }
        // ]
      });
      return res.status(200).json({ data });
    } catch (err) {
      console.error("Erreur lors de la récupération des statuts:", err);
      return res.status(500).json({ message: err.message || "Une erreur est survenue lors de la récupération des statuts." });
    }
  },

  // Récupération d'un statut par son identifiant
  getStatutsById: async (req, res) => {
    const id = req.params.id;
    try {
      const data = await Statuts.findByPk(id, {
        // Retirer les associations problématiques temporairement
        // include: [
        //   { model: db.NumeroPays },
        //   { model: db.Pays }
        // ]
      });
      if (!data) {
        return res.status(404).json({ message: `Impossible de trouver le statut avec id=${id}.` });
      }
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erreur lors de la récupération du statut:", err);
      return res.status(500).json({ message: "Erreur lors de la récupération du statut avec id=" + id });
    }
  },

  // Mise à jour d'un statut par son identifiant
  updateStatuts: async (req, res) => {
    const id = req.params.id;
    try {
      const [num] = await Statuts.update(req.body, { where: { id: id } });
      if (num === 1) {
        return res.status(200).json({ message: "Le statut a été mis à jour avec succès." });
      } else {
        return res.status(400).json({ message: `Impossible de mettre à jour le statut avec id=${id}. Peut-être que le statut n'a pas été trouvé ou req.body est vide!` });
      }
    } catch (err) {
      return res.status(500).json({ message: "Erreur lors de la mise à jour du statut avec id=" + id });
    }
  },

  // Suppression d'un statut par son identifiant
  deleteStatuts: async (req, res) => {
    const id = req.params.id;
    try {
      const num = await Statuts.destroy({ where: { id: id } });
      if (num === 1) {
        return res.status(200).json({ message: "Le statut a été supprimé avec succès!" });
      } else {
        return res.status(400).json({ message: `Impossible de supprimer le statut avec id=${id}. Peut-être que le statut n'a pas été trouvé!` });
      }
    } catch (err) {
      return res.status(500).json({ message: "Impossible de supprimer le statut avec id=" + id });
    }
  }
};

module.exports = StatutsController;
