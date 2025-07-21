const { Client, Contact, Brevet, sequelize } = require('../models');
const Op = sequelize.Sequelize.Op;
const logController = require('./logController');

const clientController = {
  createClient: async (req, res) => {
    try {
      const clientData = {
        nom_client:       req.body.nom_client       || null,
        reference_client: req.body.reference_client || null,
        adresse_client:   req.body.adresse_client   || null,
        code_postal:      req.body.code_postal      || null,
        pays_client:      req.body.pays_client      || null,
        email_client:     req.body.email_client     || null,
        telephone_client: req.body.telephone_client || null
      };
      const client = await Client.create(req.body);
      // Log action
      await logController.createLog(
        req.user && req.user.email_user ? req.user : { email_user: 'admin', prenom_user: 'admin' },
        req.user && req.user.email_user ? req.user.email_user : 'admin',
        'Création client',
        `Client créé : ${client.nom_client || client.id}`
      );
      res.status(201).json({ data: client });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  getAllClients: async (req, res) => {
    try {
      const nom = req.query.nom;
      const condition = nom ? { nom_client: { [Op.like]: `%${nom}%` } } : null;
      
      const results = await Client.findAll({
        where: condition,
        include: [
          { model: Contact },
          { model: Brevet }
        ]
      });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error("Erreur récupération clients:", error);
      res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
    }
  },
  getClientById: async (req, res) => {
    try {
      const result = await Client.findByPk(req.params.id, {
        include: [
          { model: Contact },
          { model: Brevet }
        ]
      });
      if (result) {
        res.status(200).json({ data: result });
      } else {
        res.status(404).json({ error: 'Client non trouvé' });
      }
    } catch (error) {
      console.error("Erreur récupération client:", error);
      res.status(500).json({ error: 'Erreur lors de la récupération du client' });
    }
  },
  updateClient: async (req, res) => {
    try {
      await Client.update(req.body, { where: { id: req.params.id } });
      await logController.createLog(
        req.user && req.user.email_user ? req.user : { email_user: 'admin', prenom_user: 'admin' },
        req.user && req.user.email_user ? req.user.email_user : 'admin',
        'Modification client',
        `Client modifié : ${req.params.id}`
      );
      res.status(200).json({ message: "Client mis à jour" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  getClientsByBrevetId: async (req, res) => {
    try {
      const clients = await Client.findAll({ where: { brevetId: req.params.brevetId } });
      res.status(200).json({ data: clients });
    } catch (error) {
      console.error("Erreur récupération clients par brevet ID:", error);
      res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
    }
  },
  deleteClient: async (req, res) => {
    try {
      await Client.destroy({ where: { id: req.params.id } });
      await logController.createLog(
        req.user && req.user.email_user ? req.user : { email_user: 'admin', prenom_user: 'admin' },
        req.user && req.user.email_user ? req.user.email_user : 'admin',
        'Suppression client',
        `Client supprimé : ${req.params.id}`
      );
      res.status(200).json({ message: "Client supprimé" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  addBrevet: async (req, res) => {
    try {
      const clientId = req.params.clientId;
      const brevetId = req.body.brevetId;
      
      await sequelize.models.BrevetClients.create({
        BrevetId: brevetId,
        ClientId: clientId
      });
      
      res.status(200).json({ message: 'Brevet ajouté au client avec succès!' });
    } catch (error) {
      console.error("Erreur ajout brevet au client:", error);
      res.status(500).json({ error: 'Erreur lors de l\'ajout du brevet au client' });
    }
  },
  removeBrevet: async (req, res) => {
    try {
      const clientId = req.params.clientId;
      const brevetId = req.params.brevetId;
      
      const deleted = await sequelize.models.BrevetClients.destroy({
        where: {
          BrevetId: brevetId,
          ClientId: clientId
        }
      });
      
      if (deleted) {
        res.status(200).json({ message: 'Brevet retiré du client avec succès!' });
      } else {
        res.status(404).json({ error: 'Relation brevet-client non trouvée' });
      }
    } catch (error) {
      console.error("Erreur suppression brevet du client:", error);
      res.status(500).json({ error: 'Erreur lors de la suppression du brevet du client' });
    }
  }
};

module.exports = clientController;
