const { Cabinet } = require('../models');

const cabinetController = {
  createCabinet: async (req, res) => {
    try {
      const result = await Cabinet.create(req.body);
      console.log('Cabinet créé', result);
      res.status(201).json({ message: 'Cabinet créé avec succès', data: result });
    } catch (error) {
      console.error('Erreur création cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la création du cabinet' });
    }
  },
  getAllCabinets: async (req, res) => {
    try {
      const results = await Cabinet.findAll();
      // Séparation par type
      const procedureCabinets = results.filter(c => c.type === 'procedure');
      const annuiteCabinets = results.filter(c => c.type === 'annuite');
      res.status(200).json({ procedure: procedureCabinets, annuite: annuiteCabinets });
    } catch (error) {
      console.error('Erreur récupération cabinets:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des cabinets' });
    }
  },
  getCabinetById: async (req, res) => {
    try {
      const result = await Cabinet.findByPk(req.params.id);
      if (result) {
        res.status(200).json({ data: result });
      } else {
        res.status(404).json({ error: 'Cabinet non trouvé' });
      }
    } catch (error) {
      console.error('Erreur récupération cabinet par ID:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du cabinet' });
    }
  },
  updateCabinet: async (req, res) => {
    try {
      const [updated] = await Cabinet.update(req.body, { where: { id: req.params.id } });
      if (updated) {
        const updatedCabinet = await Cabinet.findByPk(req.params.id);
        res.status(200).json({ message: 'Cabinet mis à jour', data: updatedCabinet });
      } else {
        res.status(404).json({ error: 'Cabinet non trouvé' });
      }
    } catch (error) {
      console.error('Erreur mise à jour cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du cabinet' });
    }
  },
  deleteCabinet: async (req, res) => {
    try {
      const deleted = await Cabinet.destroy({ where: { id: req.params.id } });
      if (deleted) {
        res.status(200).json({ message: 'Cabinet supprimé' });
      } else {
        res.status(404).json({ error: 'Cabinet non trouvé' });
      }
    } catch (error) {
      console.error('Erreur suppression cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du cabinet' });
    }
  },
  getCabinetsByBrevetId: async (req, res) => {
    try {
      const brevetId = req.query.id_brevet;
      if (!brevetId) {
        return res.status(400).json({ message: 'id_brevet manquant' });
      }
      const results = await Cabinet.findAll({ where: { brevetId } });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération cabinets par brevet ID:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des cabinets' });
    }
  },
  getAllCabinetReferences: async (req, res) => {
    try {
      const results = await Cabinet.findAll({ attributes: ['reference'] });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération références cabinets:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des références de cabinets' });
    }
  }
};

module.exports = cabinetController;
