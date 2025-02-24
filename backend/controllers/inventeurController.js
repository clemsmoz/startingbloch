const Inventeur = require('../models/inventeurModel');

const inventeurController = {
  createInventeur: async (req, res) => {
    try {
      const result = await Inventeur.create(req.body);
      console.log('Inventeur créé', result);
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur création inventeur:', error);
      res.status(500).json({ error: 'Erreur lors de la création de l\'inventeur' });
    }
  },
  getAllInventeurs: async (req, res) => {
    try {
      const results = await Inventeur.findAll();
      res.status(200).json(results);
    } catch (error) {
      console.error('Erreur récupération inventeurs:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des inventeurs' });
    }
  },
  getInventeurById: async (req, res) => {
    try {
      let idInventeurs = req.query.id_inventeurs;
      if (!idInventeurs || (Array.isArray(idInventeurs) && idInventeurs.length === 0)) {
        return res.status(400).json({ error: 'Aucun ID d\'inventeur fourni' });
      }
      idInventeurs = Array.isArray(idInventeurs) ? idInventeurs.map(Number) : [parseInt(idInventeurs, 10)];
      const results = await Inventeur.findAll({ where: { id: idInventeurs } });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération inventeur par ID:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des inventeurs' });
    }
  },
  updateInventeur: async (req, res) => {
    try {
      const [updated] = await Inventeur.update(req.body, { where: { id: req.params.id } });
      if (updated) {
        const updatedInventeur = await Inventeur.findByPk(req.params.id);
        res.status(200).json(updatedInventeur);
      } else {
        res.status(404).json({ error: 'Inventeur non trouvé' });
      }
    } catch (error) {
      console.error('Erreur mise à jour inventeur:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'inventeur' });
    }
  },
  deleteInventeur: async (req, res) => {
    try {
      const deleted = await Inventeur.destroy({ where: { id: req.params.id } });
      if (deleted) {
        res.status(200).json({ message: 'Inventeur supprimé' });
      } else {
        res.status(404).json({ error: 'Inventeur non trouvé' });
      }
    } catch (error) {
      console.error('Erreur suppression inventeur:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression de l\'inventeur' });
    }
  }
};

module.exports = inventeurController;
