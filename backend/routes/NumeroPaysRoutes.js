const express = require('express');
const NumeroPaysController = require('../controllers/NumeroPaysController');

const router = express.Router();

router.post('/numeros_pays', NumeroPaysController.createNumeroPays);
router.get('/numeros_pays', NumeroPaysController.getNumeroPaysByBrevetId); // This will handle the ?id_brevet=X parameter
router.get('/numeros_pays/:id', NumeroPaysController.getNumeroPaysById);
router.put('/numeros_pays/:id', NumeroPaysController.updateNumeroPays);
router.delete('/numeros_pays/:id', NumeroPaysController.deleteNumeroPays);

module.exports = router;
