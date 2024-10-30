const db = require('../config/dbconfig');

class User {
  constructor(nom_user, prenom_user, email_user, password) {
    this.nom_user = nom_user;
    this.prenom_user = prenom_user;
    this.email_user = email_user;
    this.password_user = password;
  }

  static create(userData, callback) {
    const { nom_user, prenom_user, email_user, password, salt } = userData;
    const query = 'INSERT INTO users (nom_user, prenom_user, email_user, password_user, salt) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nom_user, prenom_user, email_user, password, salt], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  static getAll(callback) {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM users WHERE id_users = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results[0]);
    });
  }

  static update(id, userData, callback) {
    const { nom_user, prenom_user, email_user, password, salt } = userData;
    const query = 'UPDATE users SET nom_user = ?, prenom_user = ?, email_user = ?, password_user = ?, salt = ? WHERE id_users = ?';
    db.query(query, [nom_user, prenom_user, email_user, password, salt, id], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  static delete(id, callback) {
    const query = 'DELETE FROM users WHERE id_users = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  static authenticate(email, callback) {
    // Récupère l'utilisateur uniquement par email pour obtenir le hash et le sel dans le contrôleur
    const query = 'SELECT * FROM users WHERE email_user = ?';
    db.query(query, [email], (err, results) => {
      if (err) {
        return callback(err);
      }
      if (results.length > 0) {
        callback(null, results[0]); // Retourne l'utilisateur pour vérification dans le contrôleur
      } else {
        callback(new Error('Invalid email or password'));
      }
    });
  }
}

module.exports = User;
