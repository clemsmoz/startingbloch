const express = require('express');
const brevetController = require('../controllers/brevetController');

const router = express.Router();

router.post('/brevets', brevetController.createBrevet); // Route correcte
router.get('/brevets', brevetController.getAllBrevets); // Route correcte
router.get('/brevets/:id', brevetController.getBrevetById); // Route correcte
router.get('/brevets/client/:id', brevetController.getByClientId); // Route correcte
router.put('/brevets/:id', brevetController.updateBrevet); // Route correcte
router.delete('/brevets/:id', brevetController.deleteBrevet); // Route correcte
router.get('/brevets/:id/piece-jointe', brevetController.getPiecesJointesByBrevetId); // Route correcte

// Routes supplémentaires
router.get('/brevets-with-relations', brevetController.getAllBrevetsWithRelations); // Route correcte
router.get('/brevets/:id/with-relations', brevetController.getBrevetByIdWithRelations); // Route correcte
router.post('/brevets/:brevetId/titulaires', brevetController.addTitulaire); // Route correcte
router.post('/brevets/:brevetId/inventeurs', brevetController.addInventeur); // Route correcte
router.post('/brevets/:brevetId/deposants', brevetController.addDeposant); // Route correcte

module.exports = router;
