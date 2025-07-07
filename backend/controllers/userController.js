const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { User } = require('../models');

const userController = {
  createUser: (req, res) => {
    const userData = req.body;

    // Vérification des champs obligatoires
    if (!userData.email_user || !userData.password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    // Vérifie si l'email existe déjà
    User.findOne({ where: { email_user: userData.email_user } })
      .then(existingUser => {
        if (existingUser) {
          return res.status(409).json({ error: "Cet email est déjà utilisé." });
        }

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

          userData.password_user = derivedKey.toString('hex');
          userData.salt = salt;
          delete userData.password;

          // Création de l'utilisateur
          User.create(userData)
            .then(results => {
              res.status(201).json({ message: 'User created successfully', data: results });
            })
            .catch(err => {
              console.error('Error creating user:', err);
              res.status(500).json({ error: err.message });
            });
        });
      })
      .catch(err => {
        console.error('Error checking existing user:', err);
        res.status(500).json({ error: 'Erreur lors de la vérification de l\'email' });
      });
  },

  authenticateUser: (req, res) => {
    const { email_user, password } = req.body;
    console.log('Authenticating user with email:', email_user);

    // Utilise la méthode Sequelize standard pour récupérer l'utilisateur par email
    User.findOne({ where: { email_user } })
      .then(user => {
        if (!user) {
          console.warn('Authentication failed: User not found');
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Utilise le sel stocké pour vérifier le mot de passe
        const salt = user.salt;
        const iterations = 10000;
        const keyLength = 64;

        // Re-hash le mot de passe entré pour le comparer au hash stocké
        crypto.pbkdf2(password, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
          if (err) {
            console.error('Error verifying password:', err);
            return res.status(500).json({ error: 'Failed to verify password' });
          }

          const hashedPassword = derivedKey.toString('hex');
          if (hashedPassword === user.password_user) {
            // Met à jour la date de dernière connexion EN BASE
            User.update(
              { lastLoginAt: new Date() },
              { where: { id: user.id } }
            ).catch(() => {});
            res.status(200).json({ message: 'User authenticated successfully', user: { ...user.toJSON(), lastLoginAt: new Date() } });
          } else {
            console.warn('Authentication failed: Incorrect password');
            res.status(401).json({ error: 'Invalid email or password' });
          }
        });
      })
      .catch(err => {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      });
  },



  getAllUsers: async (req, res) => {
    try {
      // Utilise la méthode Sequelize standard pour récupérer tous les utilisateurs
      const users = await User.findAll();
      res.status(200).json({ data: users });
    } catch (err) {
      console.error('Error getting users:', err);
      res.status(500).json({ error: err.message });
    }
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

    // Si un nouveau mot de passe est fourni, le hasher et mettre à jour le salt
    if (userData.password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const iterations = 10000;
      const keyLength = 64;

      crypto.pbkdf2(userData.password, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
        if (err) {
          console.error('Error hashing password:', err);
          return res.status(500).json({ error: 'Failed to hash password' });
        }
        userData.password_user = derivedKey.toString('hex');
        userData.salt = salt;
        delete userData.password;

        // Mise à jour de l'utilisateur avec le nouveau mot de passe hashé
        User.update(userData, { where: { id: userId } })
          .then(() => res.status(200).json({ message: 'User updated successfully' }))
          .catch(err => {
            console.error('Error updating user:', err);
            res.status(500).json({ error: err.message });
          });
      });
    } else {
      // Mise à jour sans changement de mot de passe
      delete userData.password; // On ne veut jamais stocker le mot de passe en clair
      User.update(userData, { where: { id: userId } })
        .then(() => res.status(200).json({ message: 'User updated successfully' }))
        .catch(err => {
          console.error('Error updating user:', err);
          res.status(500).json({ error: err.message });
        });
    }
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

  // Ajoute la possibilité de bloquer/débloquer un utilisateur
  blockUser: (req, res) => {
    const userId = req.params.id;
    const { isBlocked } = req.body;
    User.update({ isBlocked }, { where: { id: userId } })
      .then(() => res.status(200).json({ message: `User ${isBlocked ? 'bloqué' : 'débloqué'}` }))
      .catch(err => res.status(500).json({ error: err.message }));
  },

  // Réinitialisation du mot de passe par l'admin (génère un nouveau mot de passe)
  resetPassword: (req, res) => {
    const userId = req.params.id;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: "Nouveau mot de passe requis" });

    const salt = crypto.randomBytes(16).toString('hex');
    const iterations = 10000;
    const keyLength = 64;

    crypto.pbkdf2(newPassword, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
      if (err) return res.status(500).json({ error: 'Erreur lors du hash du mot de passe' });
      const password_user = derivedKey.toString('hex');
      User.update({ password_user, salt }, { where: { id: userId } })
        .then(() => res.status(200).json({ message: "Mot de passe réinitialisé avec succès" }))
        .catch(err => res.status(500).json({ error: err.message }));
    });
  },
};



module.exports = userController;
