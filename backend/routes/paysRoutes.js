const express = require('express');
const paysController = require('../controllers/paysController');

const router = express.Router();

router.get('/pays', paysController.getAllPays);
router.post('/pays', paysController.createPays);
router.get('/pays/:id', paysController.getPaysById);
router.put('/pays/:id', paysController.updatePays);
router.delete('/pays/:id', paysController.deletePays);

module.exports = router;
