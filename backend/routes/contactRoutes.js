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

// Les routes invoquent les fonctions : 
// - Pour cabinets : createContactForCabinet, getAllContactsFromCabinet, getContactsByCabinetId, updateContactForCabinet, deleteContactFromCabinet
// - Pour clients : createContactForClient, getAllContactsFromClient, getContactsByClientId, updateContactForClient, deleteContactFromClient
// Aucune modification n'est requise.

module.exports = router;
