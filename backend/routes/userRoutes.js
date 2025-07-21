const express = require('express');
const userController = require('../controllers/userController');
const authUserMiddleware = require('../middleware/authUserMiddleware');

const router = express.Router();

// Applique le middleware sur toutes les routes sauf /login et GET /users (pour la création du premier admin)
router.post('/login', userController.authenticateUser);

// Permettre la récupération de la liste des users SANS auth pour permettre la création du premier admin
router.get('/users', userController.getAllUsers);

router.post('/users', authUserMiddleware, userController.createUser);
router.get('/users/:id', authUserMiddleware, userController.getUserById);
router.put('/users/:id', authUserMiddleware, userController.updateUser);
router.delete('/users/:id', authUserMiddleware, userController.deleteUser);
router.put('/users/:id/block', authUserMiddleware, userController.blockUser);
router.put('/users/:id/reset-password', authUserMiddleware, userController.resetPassword);

module.exports = router;
