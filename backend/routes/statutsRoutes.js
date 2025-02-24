const express = require('express');
const statutsController = require('../controllers/statutsController');

const router = express.Router();

router.get('/statuts', statutsController.getAllStatuts);

module.exports = router;
