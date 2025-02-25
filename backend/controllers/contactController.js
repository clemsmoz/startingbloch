const Contact = require('../models/Contact');

const contactController = {
  createContactForCabinet: async (req, res) => {
    try {
      const result = await Contact.create({ ...req.body, type: 'cabinet' });
      console.log('Contact pour cabinet créé', result);
      res.status(201).json({ message: 'Contact créé avec succès', data: result });
    } catch (error) {
      console.error('Erreur création contact cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la création du contact pour cabinet' });
    }
  },
  getAllContactsFromCabinet: async (req, res) => {
    try {
      const results = await Contact.findAll({ where: { type: 'cabinet' } });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération contacts cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des contacts pour cabinet' });
    }
  },
  getContactsByCabinetId: async (req, res) => {
    try {
      const idCabinet = req.params.id;
      const results = await Contact.findAll({ where: { type: 'cabinet', cabinetId: idCabinet } });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération contacts cabinet par ID:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des contacts pour cabinet' });
    }
  },
  updateContactForCabinet: async (req, res) => {
    try {
      const [updated] = await Contact.update(req.body, { where: { id: req.params.id, type: 'cabinet' } });
      if (updated) {
        const updatedContact = await Contact.findByPk(req.params.id);
        res.status(200).json({ message: 'Contact mis à jour', data: updatedContact });
      } else {
        res.status(404).json({ error: 'Contact non trouvé' });
      }
    } catch (error) {
      console.error('Erreur mise à jour contact cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du contact pour cabinet' });
    }
  },
  deleteContactFromCabinet: async (req, res) => {
    try {
      const deleted = await Contact.destroy({ where: { id: req.params.id, type: 'cabinet' } });
      if (deleted) {
        res.status(200).json({ message: 'Contact supprimé' });
      } else {
        res.status(404).json({ error: 'Contact non trouvé' });
      }
    } catch (error) {
      console.error('Erreur suppression contact cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du contact pour cabinet' });
    }
  },
  createContactForClient: async (req, res) => {
    try {
      const result = await Contact.create({ ...req.body, type: 'client' });
      console.log('Contact pour client créé', result);
      res.status(201).json({ message: 'Contact créé avec succès', data: result });
    } catch (error) {
      console.error('Erreur création contact client:', error);
      res.status(500).json({ error: 'Erreur lors de la création du contact pour client' });
    }
  },
  getAllContactsFromClient: async (req, res) => {
    try {
      const results = await Contact.findAll({ where: { type: 'client' } });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération contacts client:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des contacts pour client' });
    }
  },
  getContactsByClientId: async (req, res) => {
    try {
      const idClient = req.params.id_client;
      const results = await Contact.findAll({ where: { type: 'client', clientId: idClient } });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération contacts client par ID:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des contacts pour client' });
    }
  },
  updateContactForClient: async (req, res) => {
    try {
      const [updated] = await Contact.update(req.body, { where: { id: req.params.id, type: 'client' } });
      if (updated) {
        const updatedContact = await Contact.findByPk(req.params.id);
        res.status(200).json({ message: 'Contact mis à jour', data: updatedContact });
      } else {
        res.status(404).json({ error: 'Contact non trouvé' });
      }
    } catch (error) {
      console.error('Erreur mise à jour contact client:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du contact pour client' });
    }
  },
  deleteContactFromClient: async (req, res) => {
    try {
      const deleted = await Contact.destroy({ where: { id: req.params.id, type: 'client' } });
      if (deleted) {
        res.status(200).json({ message: 'Contact supprimé' });
      } else {
        res.status(404).json({ error: 'Contact non trouvé' });
      }
    } catch (error) {
      console.error('Erreur suppression contact client:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du contact pour client' });
    }
  }
};

module.exports = contactController;
