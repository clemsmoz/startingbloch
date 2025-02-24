const Client = require('../models/clientModel');

const clientController = {
  createClient: async (req, res) => {
    try {
      console.log("Données client reçues:", req.body);
      const result = await Client.create(req.body);
      res.status(201).json({ message: 'Client créé avec succès', data: result });
    } catch (error) {
      console.error("Erreur création client:", error);
      res.status(500).json({ error: 'Erreur lors de la création du client' });
    }
  },
  getAllClients: async (req, res) => {
    try {
      const results = await Client.findAll();
      res.status(200).json({ data: results });
    } catch (error) {
      console.error("Erreur récupération clients:", error);
      res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
    }
  },
  getClientById: async (req, res) => {
    try {
      const result = await Client.findByPk(req.params.id);
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
      const [updated] = await Client.update(req.body, { where: { id: req.params.id } });
      if (updated) {
        const updatedClient = await Client.findByPk(req.params.id);
        res.status(200).json({ message: 'Client mis à jour', data: updatedClient });
      } else {
        res.status(404).json({ error: 'Client non trouvé' });
      }
    } catch (error) {
      console.error("Erreur mise à jour client:", error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du client' });
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
  }
};

module.exports = clientController;
