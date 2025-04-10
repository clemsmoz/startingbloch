const express = require('express');
const cabinetController = require('../controllers/cabinetController');

const router = express.Router();

router.post('/cabinet', cabinetController.createCabinet);
router.get('/cabinet', cabinetController.getAllCabinets);
router.get('/cabinet/:id', cabinetController.getCabinetById);
router.put('/cabinet/:id', cabinetController.updateCabinet);
router.delete('/cabinet/:id', cabinetController.deleteCabinet);
router.get('/cabinets', cabinetController.getCabinetsByBrevetId); // Handle ?id_brevet=X parameter
router.get('/reference', cabinetController.getAllCabinetReferences);

// Ajout des routes pour l'association de pays à un cabinet
// router.post('/cabinet/:cabinetId/pays', cabinetController.addPays);
// router.delete('/cabinet/:cabinetId/pays/:paysId', cabinetController.removePays);

module.exports = router;
