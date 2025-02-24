const express = require('express');
const cabinetController = require('../controllers/cabinetController');

const router = express.Router();

router.post('/cabinet', cabinetController.createCabinet);
router.get('/cabinet', cabinetController.getAllCabinets);
router.get('/cabinet/:id', cabinetController.getCabinetById);
router.put('/cabinet/:id', cabinetController.updateCabinet);
router.delete('/cabinet/:id', cabinetController.deleteCabinet);
router.get('/cabinets', cabinetController.getCabinetsByBrevetId);
router.get('/reference', cabinetController.getAllCabinetReferences);

module.exports = router;
