const express = require('express');
const inventeurController = require('../controllers/inventeurController');

const router = express.Router();

// Changement de '/inventeur' en '/inventeur/:id' pour inclure l'id attendu par getInventeurById
router.get('/inventeur/:id', inventeurController.getInventeurById);
router.get('/inventeurs', inventeurController.getAllInventeurs);
router.post('/inventeurs', inventeurController.createInventeur);
router.put('/inventeurs/:id', inventeurController.updateInventeur);
router.delete('/inventeurs/:id', inventeurController.deleteInventeur);

module.exports = router;
