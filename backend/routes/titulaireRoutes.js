const express = require('express');
const titulaireController = require('../controllers/titulaireController');

const router = express.Router();

router.get('/titulaire/:id', titulaireController.getTitulaireById);
router.get('/titulaires', titulaireController.getAllTitulaires);
router.post('/titulaires', titulaireController.createTitulaire);
router.put('/titulaires/:id', titulaireController.updateTitulaire);
router.delete('/titulaires/:id', titulaireController.deleteTitulaire);

module.exports = router;
