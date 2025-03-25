const express = require('express');
const brevetController = require('../controllers/brevetController');

const router = express.Router();

router.post('/brevets', brevetController.createBrevet); 
router.get('/brevets', brevetController.getAllBrevets);
router.get('/brevets/:id', brevetController.getBrevetById);
router.get('/brevets/client/:id', brevetController.getByClientId);
router.put('/brevets/:id', brevetController.updateBrevet);
router.delete('/brevets/:id', brevetController.deleteBrevet);
// La ligne suivante fait référence à une fonction qui n'existe pas dans le contrôleur
// Commenter ou supprimer cette ligne pour résoudre l'erreur
// router.get('/brevets/:id/piece-jointe', brevetController.getPiecesJointesByBrevetId);

// Routes supplémentaires
router.get('/brevets-with-relations', brevetController.getAllBrevetsWithRelations);
router.get('/brevets/:id/with-relations', brevetController.getBrevetByIdWithRelations);
router.post('/brevets/:brevetId/titulaires', brevetController.addTitulaire);
router.post('/brevets/:brevetId/inventeurs', brevetController.addInventeur);
router.post('/brevets/:brevetId/deposants', brevetController.addDeposant);

module.exports = router;
