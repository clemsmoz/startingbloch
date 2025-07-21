const { Contact, Client, Cabinet, ContactEmail, ContactPhone, ContactRole, Sequelize } = require('../models');
const Op = Sequelize.Op;
const logController = require('./logController');

const contactController = {
  // Création d'un contact pour un cabinet
  createContactForCabinet: async (req, res) => {
    try {
      // Ajout de logs pour debug req.user
      console.log('DEBUG LOG - createContactForCabinet');
      console.log('req.user:', req.user);
      console.log('req.user?.email_user:', req.user?.email_user);

      const { emails, phones, roles, ...contactData } = req.body;
      const contact = await Contact.create(contactData);
      // Ajoute les emails
      if (Array.isArray(emails)) {
        await Promise.all(emails.map(email =>
          ContactEmail.create({ contact_id: contact.id, email })
        ));
      }
      // Ajoute les téléphones
      if (Array.isArray(phones)) {
        await Promise.all(phones.map(phone =>
          ContactPhone.create({ contact_id: contact.id, phone })
        ));
      }
      // Ajoute les rôles
      if (Array.isArray(roles)) {
        await Promise.all(roles.map(role =>
          ContactRole.create({ contact_id: contact.id, role })
        ));
      }
      await logController.createLog(
        req.user && req.user.email_user ? req.user : { email_user: 'inconnu', prenom_user: 'inconnu' },
        req.user && req.user.email_user ? req.user.email_user : 'inconnu',
        'Création contact',
        `Contact créé (cabinet) : ${contact.nom_contact || contact.id}`
      );
      res.status(201).json({ message: 'Contact créé avec succès', data: contact });
    } catch (error) {
      console.error('Erreur création contact cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la création du contact pour cabinet' });
    }
  },

  // Récupération de tous les contacts d'un cabinet via query string (ex: /contacts?cabinet_id=1)
  getAllContactsFromCabinet: async (req, res) => {
    try {
      const cabinetId = req.query.cabinet_id;
      if (!cabinetId) {
        return res.status(400).json({ error: 'cabinet_id is required' });
      }
      const results = await Contact.findAll({ where: { cabinet_id: cabinetId } });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération contacts cabinet:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des contacts pour cabinet' });
    }
  },

  // Récupération de contacts d'un cabinet via paramètre d'URL (ex: /contacts/cabinets/1)
  getContactsByCabinetId: async (req, res) => {
    try {
      const cabinetId = req.params.id;
      if (!cabinetId) {
        return res.status(400).json({ error: 'cabinet id is required' });
      }
      const results = await Contact.findAll({ where: { cabinet_id: cabinetId } });
      
      // Modifier la structure de la réponse pour qu'elle soit directement utilisable
      // dans le frontend sans manipulation complexe
      res.status(200).json(results);
    } catch (error) {
      console.error('Erreur récupération contacts cabinet par ID:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des contacts pour cabinet' });
    }
  },

  // Mise à jour d'un contact pour un cabinet
  updateContactForCabinet: async (req, res) => {
    try {
      // On filtre par id et par cabinet_id (attendu dans req.body ou déjà connu)
      const [updated] = await Contact.update(req.body, {
        where: { id: req.params.id, cabinet_id: req.body.cabinet_id }
      });
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

  // Suppression d'un contact pour un cabinet
  deleteContactFromCabinet: async (req, res) => {
    try {
      const deleted = await Contact.destroy({
        where: { id: req.params.id, cabinet_id: req.body.cabinet_id }
      });
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

  // Création d'un contact pour un client
  createContactForClient: async (req, res) => {
    try {
      console.log('DEBUG LOG - createContactForClient');
      console.log('req.user:', req.user);
      console.log('req.user?.email_user:', req.user?.email_user);

      const { emails, phones, roles, ...contactData } = req.body;
      const contact = await Contact.create(contactData);
      if (Array.isArray(emails)) {
        await Promise.all(emails.map(email =>
          ContactEmail.create({ contact_id: contact.id, email })
        ));
      }
      if (Array.isArray(phones)) {
        await Promise.all(phones.map(phone =>
          ContactPhone.create({ contact_id: contact.id, phone })
        ));
      }
      if (Array.isArray(roles)) {
        await Promise.all(roles.map(role =>
          ContactRole.create({ contact_id: contact.id, role })
        ));
      }
      await logController.createLog(
        req.user && req.user.email_user ? req.user : { email_user: 'inconnu', prenom_user: 'inconnu' },
        req.user && req.user.email_user ? req.user.email_user : 'inconnu',
        'Création contact',
        `Contact créé (client) : ${contact.nom_contact || contact.id}`
      );
      res.status(201).json({ message: 'Contact créé avec succès', data: contact });
    } catch (error) {
      console.error('Erreur création contact client:', error);
      res.status(500).json({ error: 'Erreur lors de la création du contact pour client' });
    }
  },

  // Récupération de tous les contacts d'un client via query string (ex: /contacts?client_id=1)
  getAllContactsFromClient: async (req, res) => {
    try {
      const clientId = req.query.client_id;
      if (!clientId) {
        return res.status(400).json({ error: 'client_id is required' });
      }
      const results = await Contact.findAll({ where: { client_id: clientId } });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération contacts client:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des contacts pour client' });
    }
  },

  // Récupération de contacts d'un client via paramètre d'URL (ex: /contacts/clients/1)
  getContactsByClientId: async (req, res) => {
    try {
      const clientId = req.params.id_client;
      if (!clientId) {
        return res.status(400).json({ error: 'client id is required' });
      }
      const results = await Contact.findAll({ where: { client_id: clientId } });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération contacts client par ID:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des contacts pour client' });
    }
  },

  // Mise à jour d'un contact pour un client
  updateContactForClient: async (req, res) => {
    try {
      const [updated] = await Contact.update(req.body, {
        where: { id: req.params.id, client_id: req.body.client_id }
      });
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

  // Suppression d'un contact pour un client
  deleteContactFromClient: async (req, res) => {
    try {
      const deleted = await Contact.destroy({
        where: { id: req.params.id, client_id: req.body.client_id }
      });
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

  // Création générique d'un contact (avec vérification qu'il ne soit pas associé aux deux entités)
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

  // Récupération de tous les contacts avec option de filtre par nom
  findAll: async (req, res) => {
    try {
      const nom = req.query.nom;
      const condition = nom ? { nom_contact: { [Op.like]: `%${nom}%` } } : null;

      const data = await Contact.findAll({
        where: condition,
        include: [
          { model: ContactEmail, as: 'emails' },
          { model: ContactPhone, as: 'phones' },
          { model: ContactRole, as: 'roles' },
          { model: Client },
          { model: Cabinet }
        ]
      });
      
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: error.message || "Une erreur est survenue lors de la récupération des contacts."
      });
    }
  },

  // Récupération d'un contact par son ID, avec les emails et téléphones associés
  findOne: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await Contact.findByPk(id, {
        include: [
          { model: ContactEmail, as: 'emails' },
          { model: ContactPhone, as: 'phones' },
          { model: ContactRole, as: 'roles' },
          { model: Client },
          { model: Cabinet }
        ]
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

  // Récupération de contacts par client via un paramètre "clientId"
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

  // Récupération de contacts par cabinet via un paramètre "cabinetId"
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

  // Mise à jour générique d'un contact
  update: async (req, res) => {
    try {
      console.log('DEBUG LOG - updateContact');
      console.log('req.user:', req.user);
      console.log('req.user?.email_user:', req.user?.email_user);

      const id = req.params.id;
      const { emails, phones, roles, ...contactData } = req.body;
      await Contact.update(contactData, { where: { id } });
      // Met à jour les emails
      if (Array.isArray(emails)) {
        await ContactEmail.destroy({ where: { contact_id: id } });
        await Promise.all(emails.map(email =>
          ContactEmail.create({ contact_id: id, email })
        ));
      }
      // Met à jour les téléphones
      if (Array.isArray(phones)) {
        await ContactPhone.destroy({ where: { contact_id: id } });
        await Promise.all(phones.map(phone =>
          ContactPhone.create({ contact_id: id, phone })
        ));
      }
      // Met à jour les rôles
      if (Array.isArray(roles)) {
        await ContactRole.destroy({ where: { contact_id: id } });
        await Promise.all(roles.map(role =>
          ContactRole.create({ contact_id: id, role })
        ));
      }
      await logController.createLog(
        req.user && req.user.email_user ? req.user : { email_user: 'inconnu', prenom_user: 'inconnu' },
        req.user && req.user.email_user ? req.user.email_user : 'inconnu',
        'Modification contact',
        `Contact modifié : ${id}`
      );
      res.status(200).json({ message: "Le contact a été mis à jour avec succès." });
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la mise à jour du contact avec id=" + req.params.id
      });
    }
  },

  // Suppression générique d'un contact
  delete: async (req, res) => {
    try {
      console.log('DEBUG LOG - deleteContact');
      console.log('req.user:', req.user);
      console.log('req.user?.email_user:', req.user?.email_user);

      const id = req.params.id;
      const num = await Contact.destroy({
        where: { id: id }
      });

      if (num == 1) {
        await logController.createLog(
          req.user && req.user.email_user ? req.user : { email_user: 'inconnu', prenom_user: 'inconnu' },
          req.user && req.user.email_user ? req.user.email_user : 'inconnu',
          'Suppression contact',
          `Contact supprimé : ${id}`
        );
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
