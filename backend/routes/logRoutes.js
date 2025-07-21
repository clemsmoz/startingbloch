const express = require('express');
const logController = require('../controllers/logController');
const router = express.Router();

// Route pour récupérer tous les logs (admin uniquement)
router.get('/logs', logController.getAllLogs);

module.exports = router;
