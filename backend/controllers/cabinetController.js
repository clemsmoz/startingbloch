const { Cabinet, Pays, Brevet, sequelize } = require('../models');

const cabinetController = {
  createCabinet: async (req, res) => {
    try {
      // Ignorer les données de pays et utiliser uniquement les données du cabinet
      const { pays, ...cabinetData } = req.body;
      
      // Création du cabinet dans la table 'cabinet'
      const cabinet = await Cabinet.create(cabinetData);
      
      console.log('Cabinet créé', cabinet);
      res.status(201).json({ message: 'Cabinet créé avec succès', data: cabinet });
    } catch (error) {
      console.error('Erreur création cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la création du cabinet' });
    }
  },

  // Récupère tous les cabinets
  getAllCabinets: async (req, res) => {
    try {
      const cabinets = await Cabinet.findAll();
      res.status(200).json({ data: cabinets });
    } catch (error) {
      console.error('Erreur récupération cabinets:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des cabinets' });
    }
  },

  // Récupère un cabinet par son ID
  getCabinetById: async (req, res) => {
    try {
      const cabinet = await Cabinet.findByPk(req.params.id);
      if (cabinet) {
        res.status(200).json({ data: cabinet });
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
        return res.status(400).json({ error: 'Paramètre id_brevet requis' });
      }
      
      const cabinets = await Cabinet.findAll({
        include: [{
          model: Brevet,
          where: { id: brevetId },
          attributes: [] // Don't include brevet data, just filter by it
        }]
      });
      
      res.status(200).json(cabinets);
    } catch (error) {
      console.error('Erreur récupération cabinets par brevet:', error);
      res.status(500).json({ error: error.message });
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
