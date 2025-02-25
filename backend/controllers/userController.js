const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { User } = require('../models');

const userController = {
  createUser: (req, res) => {
    const userData = req.body;

    // Génère un sel unique pour l'utilisateur
    const salt = crypto.randomBytes(16).toString('hex');
    const iterations = 10000;
    const keyLength = 64;

    // Hash le mot de passe en utilisant pbkdf2 avec SHA-256, le sel et les itérations
    crypto.pbkdf2(userData.password, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ error: 'Failed to hash password' });
      }

      // Stocke le hash et le sel
      userData.password = derivedKey.toString('hex');
      userData.salt = salt;

      console.log('Creating user with hashed password');
      User.create(userData, (err, results) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'User created successfully', data: results });
      });
    });
  },

  authenticateUser: (req, res) => {
    const { email_user, password } = req.body;
    console.log('Authenticating user with email:', email_user);

    // Utilise la méthode actuelle `findByEmail` pour récupérer l'utilisateur par email
    User.findByEmail(email_user, (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        console.warn('Authentication failed: User not found');
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      console.log('User found:', user); // Affiche les données utilisateur récupérées

      // Utilise le sel stocké pour vérifier le mot de passe
      const salt = user.salt;
      console.log('Salt retrieved for user:', salt); // Log du sel

      const iterations = 10000;
      const keyLength = 64;

      // Re-hash le mot de passe entré pour le comparer au hash stocké
      crypto.pbkdf2(password, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
        if (err) {
          console.error('Error verifying password:', err);
          return res.status(500).json({ error: 'Failed to verify password' });
        }

        const hashedPassword = derivedKey.toString('hex');
        console.log('Derived key (hashed password) for comparison:', hashedPassword);
        console.log('Stored password in database:', user.password_user); // Log du hash de la base

        // Compare le hash calculé avec celui stocké en base
        if (hashedPassword === user.password_user) {  // Utilise user.password_user
          console.log('Authentication successful');
          res.status(200).json({ message: 'User authenticated successfully', user });
        } else {
          console.warn('Authentication failed: Incorrect password');
          res.status(401).json({ error: 'Invalid email or password' });
        }
      });
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
  }
};

module.exports = userController;
