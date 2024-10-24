const User = require('../models/userModel');

const userController = {
  createUser: (req, res) => {
    const userData = req.body;
    console.log('Creating user with data:', userData);
    User.create(userData, (err, results) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User created successfully', data: results });
    });
  },

  getAllUsers: (req, res) => {
    User.getAll((err, results) => {
      if (err) {
        console.error('Error getting users:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ data: results });
    });
  },

  getUserById: (req, res) => {
    const userId = req.params.id;
    User.getById(userId, (err, results) => {
      if (err) {
        console.error('Error getting user:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ data: results });
    });
  },

  updateUser: (req, res) => {
    const userId = req.params.id;
    const userData = req.body;
    User.update(userId, userData, (err, results) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: 'User updated successfully', data: results });
    });
  },

  deleteUser: (req, res) => {
    const userId = req.params.id;
    User.delete(userId, (err, results) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: 'User deleted successfully', data: results });
    });
  },

  authenticateUser: (req, res) => {
    const { email_user, password } = req.body;
    console.log('Authenticating user with email:', email_user);
    User.authenticate(email_user, password, (err, user) => {
      if (err) {
        console.error('Error authenticating user:', err);
        return res.status(401).json({ error: err.message });
      }
      res.status(200).json({ message: 'User authenticated successfully', user });
    });
  }
};

module.exports = userController;
