const express = require('express');
const brevetController = require('../controllers/brevetController');

const router = express.Router();

router.post('/brevets', brevetController.createBrevet); 
router.get('/brevets', brevetController.getAllBrevets);
router.get('/brevets/:id', brevetController.getBrevetById);
router.get('/brevets/client/:id', brevetController.getByClientId);
router.put('/brevets/:id', brevetController.updateBrevet);
router.delete('/brevets/:id', brevetController.deleteBrevet);

// Routes supplémentaires
router.get('/brevets-with-relations', brevetController.getAllBrevetsWithRelations);
router.get('/brevets/:id/with-relations', brevetController.getBrevetByIdWithRelations);
router.post('/brevets/:brevetId/titulaires', brevetController.addTitulaire);
router.post('/brevets/:brevetId/inventeurs', brevetController.addInventeur);
router.post('/brevets/:brevetId/deposants', brevetController.addDeposant);

// Nouvelle route pour récupérer les clients d'un brevet
router.get('/brevets/:id/clients', brevetController.getClientsByBrevetId);

// Nouvelles routes pour récupérer les entités associées à un brevet
router.get('/brevets/:id/statuts', brevetController.getStatutsByBrevetId);
router.get('/brevets/:id/inventeurs', brevetController.getInventeursByBrevetId);
router.get('/brevets/:id/titulaires', brevetController.getTitulairesByBrevetId);
router.get('/brevets/:id/deposants', brevetController.getDeposantsByBrevetId);
router.get('/brevets/:id/cabinets', brevetController.getAllCabinetsByBrevetId);

// Ajouter cette route
router.get('/last-update', brevetController.getLastUpdate);

module.exports = router;
