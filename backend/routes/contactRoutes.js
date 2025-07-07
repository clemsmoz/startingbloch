const express = require('express');
const contactController = require('../controllers/contactController');

const router = express.Router();

// Routes pour les contacts des cabinets
router.post('/contacts/cabinets', contactController.createContactForCabinet);
router.get('/contacts/cabinets', contactController.getAllContactsFromCabinet);
router.get('/contacts/cabinets/:id', contactController.getContactsByCabinetId);
router.put('/contacts/cabinets/:id', contactController.updateContactForCabinet);
router.delete('/contacts/cabinets/:id', contactController.deleteContactFromCabinet);

// Routes pour les contacts des clients
router.post('/contacts/clients', contactController.createContactForClient);
router.get('/contacts/clients', contactController.getAllContactsFromClient);
router.get('/contacts/clients/:id_client', contactController.getContactsByClientId);
router.put('/contacts/clients/:id', contactController.updateContactForClient);
router.delete('/contacts/clients/:id', contactController.deleteContactFromClient);

// Route pour récupérer un contact par son ID (pour /api/contacts/:id)
router.get('/contacts/:id', async (req, res) => {
  try {
    // On inclut les emails, phones et roles si besoin
    const { Contact, ContactEmail, ContactPhone, ContactRole, Client, Cabinet } = require('../models');
    const contact = await Contact.findByPk(req.params.id, {
      include: [
        { model: ContactEmail, as: 'emails' },
        { model: ContactPhone, as: 'phones' },
        { model: ContactRole, as: 'roles' },
        { model: Client },
        { model: Cabinet }
      ]
    });
    if (!contact) {
      return res.status(404).json({ error: 'Contact non trouvé' });
    }
    res.status(200).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message || "Erreur lors de la récupération du contact." });
  }
});

// Les routes invoquent les fonctions : 
// - Pour cabinets : createContactForCabinet, getAllContactsFromCabinet, getContactsByCabinetId, updateContactForCabinet, deleteContactFromCabinet
// - Pour clients : createContactForClient, getAllContactsFromClient, getContactsByClientId, updateContactForClient, deleteContactFromClient
// Aucune modification n'est requise.

module.exports = router;
