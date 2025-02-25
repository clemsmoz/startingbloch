const { Titulaire } = require('../models');

const titulaireController = {
  createTitulaire: async (req, res) => {
    try {
      const result = await Titulaire.create(req.body);
      console.log('Titulaire créé avec succès', result);
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur création titulaire:', error);
      res.status(500).json({ error: 'Erreur lors de la création du titulaire' });
    }
  },
  getAllTitulaires: async (req, res) => {
    try {
      const results = await Titulaire.findAll();
      res.status(200).json(results);
    } catch (error) {
      console.error('Erreur récupération titulaires:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des titulaires' });
    }
  },
  getTitulaireById: async (req, res) => {
    try {
      const ids = req.query.id_titulaires;
      if (!ids) {
        return res.status(400).json({ error: 'id_titulaires manquant' });
      }
      const titulaireIds = Array.isArray(ids) ? ids : ids.split(',');
      const results = await Titulaire.findAll({ where: { id: titulaireIds } });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération titulaire par ID:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du titulaire' });
    }
  },
  updateTitulaire: async (req, res) => {
    try {
      const [updated] = await Titulaire.update(req.body, { where: { id: req.params.id } });
      if (updated) {
        const updatedTitulaire = await Titulaire.findByPk(req.params.id);
        res.status(200).json(updatedTitulaire);
      } else {
        res.status(404).json({ error: 'Titulaire non trouvé' });
      }
    } catch (error) {
      console.error('Erreur mise à jour titulaire:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du titulaire' });
    }
  },
  deleteTitulaire: async (req, res) => {
    try {
      const deleted = await Titulaire.destroy({ where: { id: req.params.id } });
      if (deleted) {
        res.status(200).json({ message: 'Titulaire supprimé' });
      } else {
        res.status(404).json({ error: 'Titulaire non trouvé' });
      }
    } catch (error) {
      console.error('Erreur suppression titulaire:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du titulaire' });
    }
  }
};

module.exports = titulaireController;