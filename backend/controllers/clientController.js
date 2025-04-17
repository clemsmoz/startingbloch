const { Client, Contact, Brevet, sequelize } = require('../models');
const Op = sequelize.Sequelize.Op;

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
      const result = await Client.create(clientData);
      res.status(201).json({ message: 'Client créé', data: result });
    } catch (error) {
      console.error('Erreur création client :', error);
      res.status(500).json({ error: 'Erreur création client' });
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
      const [updated] = await Client.update({
        nom_client:       req.body.nom_client       || null,
        reference_client: req.body.reference_client || null,
        adresse_client:   req.body.adresse_client   || null,
        code_postal:      req.body.code_postal      || null,
        pays_client:      req.body.pays_client      || null,
        email_client:     req.body.email_client     || null,
        telephone_client: req.body.telephone_client || null
      }, { where: { id: req.params.id } });

      if (!updated) return res.status(404).json({ error: 'Client non trouvé' });
      const updatedClient = await Client.findByPk(req.params.id);
      res.json({ message: 'Client mis à jour', data: updatedClient });
    } catch (error) {
      console.error('Erreur maj client :', error);
      res.status(500).json({ error: 'Erreur maj client' });
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
      const deleted = await Client.destroy({ where: { id: req.params.id } });
      if (deleted) {
        res.status(200).json({ message: 'Client supprimé' });
      } else {
        res.status(404).json({ error: 'Client non trouvé' });
      }
    } catch (error) {
      console.error("Erreur suppression client:", error);
      res.status(500).json({ error: 'Erreur lors de la suppression du client' });
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
