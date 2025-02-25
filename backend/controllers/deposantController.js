const Deposant = require('../models/Deposant');

const deposantController = {
  createDeposant: async (req, res) => {
    try {
      const result = await Deposant.create(req.body);
      console.log('Deposant créé', result);
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur création déposant:', error);
      res.status(500).json({ error: 'Erreur lors de la création du déposant' });
    }
  },
  getAllDeposants: async (req, res) => {
    try {
      const results = await Deposant.findAll();
      res.status(200).json(results);
    } catch (error) {
      console.error('Erreur récupération déposants:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des déposants' });
    }
  },
  getDeposantById: async (req, res) => {
    try {
      const ids = req.query.id_deposants;
      if (!ids) {
        return res.status(400).json({ error: 'id_deposants manquant' });
      }
      const deposantIds = Array.isArray(ids) ? ids : ids.split(',');
      const results = await Deposant.findAll({ where: { id: deposantIds } });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération déposant par ID:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du déposant' });
    }
  },
  updateDeposant: async (req, res) => {
    try {
      const [updated] = await Deposant.update(req.body, { where: { id: req.params.id } });
      if (updated) {
        const updatedDeposant = await Deposant.findByPk(req.params.id);
        res.status(200).json(updatedDeposant);
      } else {
        res.status(404).json({ error: 'Deposant non trouvé' });
      }
    } catch (error) {
      console.error('Erreur mise à jour déposant:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du déposant' });
    }
  },
  deleteDeposant: async (req, res) => {
    try {
      const deleted = await Deposant.destroy({ where: { id: req.params.id } });
      if (deleted) {
        res.status(200).json({ message: 'Deposant supprimé' });
      } else {
        res.status(404).json({ error: 'Deposant non trouvé' });
      }
    } catch (error) {
      console.error('Erreur suppression déposant:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du déposant' });
    }
  }
};

module.exports = deposantController;