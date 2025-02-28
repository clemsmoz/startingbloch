const { Contact, Client, Cabinet, Sequelize } = require('../models');
const Op = Sequelize.Op;

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
  },

  create: async (req, res) => {
    try {
      const contact = {
        nom_contact: req.body.nom_contact,
        prenom_contact: req.body.prenom_contact,
        email_contact: req.body.email_contact,
        telephone_contact: req.body.telephone_contact,
        poste_contact: req.body.poste_contact,
        client_id: req.body.client_id,
        cabinet_id: req.body.cabinet_id
      };

      if (contact.client_id && contact.cabinet_id) {
        return res.status(400).json({
          message: "Un contact ne peut pas être à la fois associé à un client et à un cabinet."
        });
      }

      const data = await Contact.create(contact);
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({
        message: error.message || "Une erreur est survenue lors de la création du contact."
      });
    }
  },

  findAll: async (req, res) => {
    try {
      const nom = req.query.nom;
      const condition = nom ? { nom_contact: { [Op.like]: `%${nom}%` } } : null;

      const data = await Contact.findAll({ 
        where: condition,
        include: [{
          model: Client
        }, {
          model: Cabinet
        }]
      });
      
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: error.message || "Une erreur est survenue lors de la récupération des contacts."
      });
    }
  },

  findOne: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await Contact.findByPk(id, {
        include: [{
          model: Client
        }, {
          model: Cabinet
        }]
      });

      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({
          message: `Impossible de trouver le contact avec id=${id}.`
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération du contact avec id=" + req.params.id
      });
    }
  },

  findByClientId: async (req, res) => {
    try {
      const clientId = req.params.clientId;
      const data = await Contact.findAll({
        where: { client_id: clientId }
      });
      
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: error.message || `Une erreur est survenue lors de la récupération des contacts pour le client id=${req.params.clientId}.`
      });
    }
  },

  findByCabinetId: async (req, res) => {
    try {
      const cabinetId = req.params.cabinetId;
      const data = await Contact.findAll({
        where: { cabinet_id: cabinetId }
      });
      
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: error.message || `Une erreur est survenue lors de la récupération des contacts pour le cabinet id=${req.params.cabinetId}.`
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;

      if (req.body.client_id && req.body.cabinet_id) {
        return res.status(400).json({
          message: "Un contact ne peut pas être à la fois associé à un client et à un cabinet."
        });
      }

      const [num] = await Contact.update(req.body, {
        where: { id: id }
      });

      if (num == 1) {
        res.status(200).json({
          message: "Le contact a été mis à jour avec succès."
        });
      } else {
        res.status(404).json({
          message: `Impossible de mettre à jour le contact avec id=${id}. Peut-être que le contact n'a pas été trouvé ou req.body est vide!`
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la mise à jour du contact avec id=" + req.params.id
      });
    }
  },

  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const num = await Contact.destroy({
        where: { id: id }
      });

      if (num == 1) {
        res.status(200).json({
          message: "Le contact a été supprimé avec succès!"
        });
      } else {
        res.status(404).json({
          message: `Impossible de supprimer le contact avec id=${id}. Peut-être que le contact n'a pas été trouvé!`
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Impossible de supprimer le contact avec id=" + req.params.id
      });
    }
  }
};

module.exports = contactController;
