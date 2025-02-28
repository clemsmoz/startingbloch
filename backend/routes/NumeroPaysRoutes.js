const router = require('express').Router();
const NumeroPaysController = require('../controllers/NumeroPaysController');

router.post('/', NumeroPaysController.createNumeroPays);
router.get('/', NumeroPaysController.getAllNumeroPays);
router.get('/id/:id', NumeroPaysController.getNumeroPaysById);
router.get('/brevet/:id_brevet', NumeroPaysController.getNumeroPaysByBrevetId);
router.put('/:id', NumeroPaysController.updateNumeroPays);
router.delete('/:id', NumeroPaysController.deleteNumeroPays);

module.exports = router;
