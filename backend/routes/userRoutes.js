const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/users', userController.createUser);
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.post('/login', userController.authenticateUser);
router.put('/users/:id/block', userController.blockUser);
router.put('/users/:id/reset-password', userController.resetPassword);

module.exports = router;
