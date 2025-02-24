const express = require('express');
const paysController = require('../controllers/paysController');

const router = express.Router();

router.get('/pays', paysController.getAllPays);

module.exports = router;
