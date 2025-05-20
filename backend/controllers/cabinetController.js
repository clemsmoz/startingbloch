// Fonctions utilitaires pour les logs colorés et avec icônes
const logInfo = (...args) => console.log('\x1b[36m%s\x1b[0m', 'ℹ️', ...args);      // Cyan
const logSuccess = (...args) => console.log('\x1b[32m%s\x1b[0m', '✅', ...args);   // Vert
const logWarn = (...args) => console.warn('\x1b[33m%s\x1b[0m', '⚠️', ...args);     // Jaune
const logError = (...args) => console.error('\x1b[31m%s\x1b[0m', '❌', ...args);   // Rouge

const { Cabinet, Pays, Brevet, sequelize } = require('../models');

const cabinetController = {
  createCabinet: async (req, res) => {
    try {
      const data = await Cabinet.create({
        nom_cabinet:       req.body.nom_cabinet       || null,
        email_cabinet:     req.body.email_cabinet     || null,
        telephone_cabinet: req.body.telephone_cabinet || null,
        reference_cabinet: req.body.reference_cabinet || null,
        type:              req.body.type              || null
      });
      res.status(201).json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
  },

  // Récupère tous les cabinets
  getAllCabinets: async (req, res) => {
    try {
      const cabinets = await Cabinet.findAll();
      logSuccess('Récupération de tous les cabinets réussie');
      res.status(200).json({ data: cabinets });
    } catch (error) {
      logError('Erreur récupération cabinets:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des cabinets' });
    }
  },

  // Récupère un cabinet par son ID
  getCabinetById: async (req, res) => {
    try {
      const cabinet = await Cabinet.findByPk(req.params.id);
      if (cabinet) {
        logSuccess('Cabinet trouvé:', cabinet.id);
        res.status(200).json({ data: cabinet });
      } else {
        logWarn('Cabinet non trouvé:', req.params.id);
        res.status(404).json({ error: 'Cabinet non trouvé' });
      }
    } catch (error) {
      logError('Erreur récupération cabinet par ID:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du cabinet' });
    }
  },
  updateCabinet: async (req, res) => {
    try {
      const [cnt] = await Cabinet.update({
        nom_cabinet:       req.body.nom_cabinet       || null,
        email_cabinet:     req.body.email_cabinet     || null,
        telephone_cabinet: req.body.telephone_cabinet || null,
        reference_cabinet: req.body.reference_cabinet || null,
        type:              req.body.type              || null
      }, { where: { id: req.params.id } });
      if (cnt) {
        const updatedCabinet = await Cabinet.findByPk(req.params.id);
        res.status(200).json({ message: 'Cabinet mis à jour', data: updatedCabinet });
      } else {
        res.status(404).json({ error: 'Cabinet non trouvé' });
      }
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  deleteCabinet: async (req, res) => {
    try {
      const deleted = await Cabinet.destroy({ where: { id: req.params.id } });
      if (deleted) {
        logSuccess('Cabinet supprimé:', req.params.id);
        res.status(200).json({ message: 'Cabinet supprimé' });
      } else {
        logWarn('Cabinet non trouvé pour suppression:', req.params.id);
        res.status(404).json({ error: 'Cabinet non trouvé' });
      }
    } catch (error) {
      logError('Erreur suppression cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du cabinet' });
    }
  },
  getCabinetsByBrevetId: async (req, res) => {
    try {
      const brevetId = req.query.id_brevet;
      
      if (!brevetId) {
        logWarn('Paramètre id_brevet requis');
        return res.status(400).json({ error: 'Paramètre id_brevet requis' });
      }
      
      const cabinets = await Cabinet.findAll({
        include: [{
          model: Brevet,
          where: { id: brevetId },
          attributes: [] // Don't include brevet data, just filter by it
        }]
      });
      logSuccess('Cabinets récupérés pour brevet:', brevetId);
      res.status(200).json(cabinets);
    } catch (error) {
      logError('Erreur récupération cabinets par brevet:', error);
      res.status(500).json({ error: error.message });
    }
  },
  getAllCabinetReferences: async (req, res) => {
    try {
      const results = await Cabinet.findAll({ attributes: ['reference'] });
      logSuccess('Références cabinets récupérées');
      res.status(200).json({ data: results });
    } catch (error) {
      logError('Erreur récupération références cabinets:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des références de cabinets' });
    }
  }
};

module.exports = cabinetController;
