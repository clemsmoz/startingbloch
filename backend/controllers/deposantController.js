const db = require('../models');
const { Deposant } = db;
const Op = db.Sequelize.Op;

const deposantController = {
  createDeposant: async (req, res) => {
    try {
      const deposant = {
        nom_deposant: req.body.nom_deposant || null,
        prenom_deposant: req.body.prenom_deposant || null,
        email_deposant: req.body.email_deposant || null,
        telephone_deposant: req.body.telephone_deposant || null
      };
      
      const result = await Deposant.create(deposant);
      console.log('Deposant créé', result);
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur création déposant:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la création du déposant' });
    }
  },
  
  getAllDeposants: async (req, res) => {
    try {
      const nom = req.query.nom;
      const condition = nom ? { nom_deposant: { [Op.like]: `%${nom}%` } } : null;
      
      const results = await Deposant.findAll({ 
        where: condition,
        include: [{
          model: db.Brevet
        }, {
          model: db.Pays
        }]
      });
      res.status(200).json(results);
    } catch (error) {
      console.error('Erreur récupération déposants:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération des déposants' });
    }
  },
  
  getDeposantById: async (req, res) => {
    try {
      // Gestion de la requête par ids multiples (ancienne méthode)
      if (req.query.id_deposants) {
        const ids = req.query.id_deposants;
        const deposantIds = Array.isArray(ids) ? ids : ids.split(',');
        const results = await Deposant.findAll({ where: { id: deposantIds } });
        return res.status(200).json({ data: results });
      }
      
      // Nouvelle méthode par id unique avec inclusions
      const id = req.params.id;
      const deposant = await Deposant.findByPk(id, {
        include: [{
          model: db.Brevet
        }, {
          model: db.Pays
        }]
      });
      
      if (deposant) {
        res.status(200).json(deposant);
      } else {
        res.status(404).json({ error: `Impossible de trouver le déposant avec id=${id}` });
      }
    } catch (error) {
      console.error('Erreur récupération déposant par ID:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération du déposant' });
    }
  },
  
  updateDeposant: async (req, res) => {
    try {
      const [updated] = await Deposant.update({
        nom_deposant: req.body.nom_deposant || null,
        prenom_deposant: req.body.prenom_deposant || null,
        email_deposant: req.body.email_deposant || null,
        telephone_deposant: req.body.telephone_deposant || null
      }, { where: { id: req.params.id } });
      if (updated) {
        const updatedDeposant = await Deposant.findByPk(req.params.id);
        res.status(200).json({
          data: updatedDeposant,
          message: "Le déposant a été mis à jour avec succès."
        });
      } else {
        res.status(404).json({ error: 'Deposant non trouvé ou aucune modification effectuée' });
      }
    } catch (error) {
      console.error('Erreur mise à jour déposant:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la mise à jour du déposant' });
    }
  },
  
  deleteDeposant: async (req, res) => {
    try {
      const deleted = await Deposant.destroy({ where: { id: req.params.id } });
      if (deleted) {
        res.status(200).json({ message: 'Deposant supprimé avec succès' });
      } else {
        res.status(404).json({ error: 'Deposant non trouvé' });
      }
    } catch (error) {
      console.error('Erreur suppression déposant:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la suppression du déposant' });
    }
  },
  
  // Nouvelles méthodes ajoutées
  addPays: async (req, res) => {
    try {
      const deposantId = req.params.deposantId;
      const paysId = req.body.paysId;
      
      await db.sequelize.models.DeposantPays.create({
        DeposantId: deposantId,
        PaysId: paysId
      });
      
      res.status(200).json({ message: "Pays ajouté au déposant avec succès!" });
    } catch (error) {
      console.error('Erreur ajout pays au déposant:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de l\'ajout du pays au déposant' });
    }
  },
  
  removePays: async (req, res) => {
    try {
      const deposantId = req.params.deposantId;
      const paysId = req.params.paysId;
      
      const num = await db.sequelize.models.DeposantPays.destroy({
        where: {
          DeposantId: deposantId,
          PaysId: paysId
        }
      });
      
      if (num == 1) {
        res.status(200).json({ message: "Pays retiré du déposant avec succès!" });
      } else {
        res.status(404).json({ 
          error: `Impossible de retirer le pays id=${paysId} du déposant id=${deposantId}. La relation n'existe peut-être pas.` 
        });
      }
    } catch (error) {
      console.error('Erreur suppression pays du déposant:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la suppression du pays du déposant' });
    }
  },
  
  findBrevetsByDeposantId: async (req, res) => {
    try {
      const deposantId = req.params.deposantId;
      
      const deposant = await Deposant.findByPk(deposantId, {
        include: [{
          model: db.Brevet
        }]
      });
      
      if (deposant) {
        res.status(200).json(deposant.Brevets);
      } else {
        res.status(404).json({ error: `Impossible de trouver le déposant avec id=${deposantId}` });
      }
    } catch (error) {
      console.error('Erreur récupération brevets par déposant:', error);
      res.status(500).json({ error: error.message || `Erreur lors de la récupération des brevets pour le déposant id=${req.params.deposantId}` });
    }
  }
};

module.exports = deposantController;