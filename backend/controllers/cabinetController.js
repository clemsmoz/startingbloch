const { Cabinet, Pays, sequelize } = require('../models');

const cabinetController = {
  createCabinet: async (req, res) => {
    try {
      // Extraction des données du cabinet et de la liste des pays à associer
      const { pays, ...cabinetData } = req.body;
      
      // Création du cabinet dans la table 'cabinet'
      const cabinet = await Cabinet.create(cabinetData);
      
      // Si des pays sont fournis, on associe ces pays au cabinet via l'association many-to-many
      if (pays && pays.length > 0) {
        await cabinet.setPays(pays); // 'pays' est un tableau d'IDs
        // Recharger le cabinet pour inclure les Pays associés dans la réponse
        await cabinet.reload({ include: [{ model: Pays }] });
      }
      
      console.log('Cabinet créé', cabinet);
      res.status(201).json({ message: 'Cabinet créé avec succès', data: cabinet });
    } catch (error) {
      console.error('Erreur création cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la création du cabinet' });
    }
  },

  // Récupère tous les cabinets, en incluant les pays associés depuis la table de jointure
  getAllCabinets: async (req, res) => {
    try {
      const cabinets = await Cabinet.findAll({
        include: [{ model: Pays }]
      });
      res.status(200).json({ data: cabinets });
    } catch (error) {
      console.error('Erreur récupération cabinets:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des cabinets' });
    }
  },

  // Récupère un cabinet par son ID, en incluant les pays associés
  getCabinetById: async (req, res) => {
    try {
      const cabinet = await Cabinet.findByPk(req.params.id, {
        include: [{ model: Pays }]
      });
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
  },
  
  // Ajouter un pays à un cabinet
  addPays: async (req, res) => {
    try {
      const cabinetId = req.params.cabinetId;
      const paysId = req.body.paysId;
      
      await sequelize.models.CabinetPays.create({
        CabinetId: cabinetId,
        PaysId: paysId
      });
      
      res.status(200).json({ message: "Pays ajouté au cabinet avec succès!" });
    } catch (error) {
      console.error('Erreur ajout pays au cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de l\'ajout du pays au cabinet' });
    }
  },

  // Supprimer un pays d'un cabinet
  removePays: async (req, res) => {
    try {
      const cabinetId = req.params.cabinetId;
      const paysId = req.params.paysId;
      
      const deleted = await sequelize.models.CabinetPays.destroy({
        where: {
          CabinetId: cabinetId,
          PaysId: paysId
        }
      });
      
      if (deleted) {
        res.status(200).json({ message: "Pays retiré du cabinet avec succès!" });
      } else {
        res.status(404).json({ message: `Impossible de retirer le pays id=${paysId} du cabinet id=${cabinetId}. Peut-être que la relation n'existe pas!` });
      }
    } catch (error) {
      console.error('Erreur suppression pays du cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du pays du cabinet' });
    }
  }
};

module.exports = cabinetController;
