const express = require('express');
const clientController = require('../controllers/clientController');

const router = express.Router();

router.post('/clients', clientController.createClient);
router.get('/clients', clientController.getAllClients);
router.get('/clients/:id', clientController.getClientById);
router.put('/clients/:id', clientController.updateClient);
router.delete('/clients/:id', clientController.deleteClient);
router.get('/brevets/:brevetId/clients', clientController.getClientsByBrevetId);
// Ajout des routes pour la gestion des brevets pour un client
router.post('/clients/:clientId/brevets', clientController.addBrevet);
router.delete('/clients/:clientId/brevets/:brevetId', clientController.removeBrevet);

module.exports = router;
