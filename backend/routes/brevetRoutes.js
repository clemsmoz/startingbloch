const express = require('express');
const brevetController = require('../controllers/brevetController');

const router = express.Router();

router.post('/brevets', brevetController.createBrevet);
router.get('/brevets', brevetController.getAllBrevets);
router.get('/brevets/:id', brevetController.getBrevetById);
router.get('/brevets/:id', brevetController.getByClientId);
router.put('/brevets/:id', brevetController.updateBrevet);
router.delete('/brevets/:id', brevetController.deleteBrevet);
router.get('/brevets/client/:id', brevetController.getByClientId);
router.get('/brevets/:id/piece-jointe', brevetController.getPiecesJointesByBrevetId);

module.exports = router;
