const express = require('express');
const inventeurController = require('../controllers/inventeurController');

const router = express.Router();

router.get('/inventeur', inventeurController.getInventeurById);
router.get('/inventeurs', inventeurController.getAllInventeurs);
router.post('/inventeurs', inventeurController.createInventeur);
router.put('/inventeurs/:id', inventeurController.updateInventeur);
router.delete('/inventeurs/:id', inventeurController.deleteInventeur);

module.exports = router;
