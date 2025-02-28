const express = require('express');
const statutsController = require('../controllers/statutsController');

const router = express.Router();

// Route pour récupérer tous les statuts
router.get('/statuts', statutsController.getAllStatuts);
// Route pour créer un nouveau statut
router.post('/statuts', statutsController.createStatuts);
// Route pour récupérer un statut par son id
router.get('/statuts/:id', statutsController.getStatutsById);
// Route pour mettre à jour un statut par son id
router.put('/statuts/:id', statutsController.updateStatuts);
// Route pour supprimer un statut par son id
router.delete('/statuts/:id', statutsController.deleteStatuts);

module.exports = router;
