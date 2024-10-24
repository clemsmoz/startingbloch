const db = require('../config/dbconfig');

class User {
  constructor(nom_user, prenom_user, email_user, password) {
    this.nom_user = nom_user;
    this.prenom_user = prenom_user;
    this.email_user = email_user;
    this.password_user = password;
  }

  static create(userData, callback) {
    const { nom_user, prenom_user, email_user, password } = userData;
    const query = 'INSERT INTO users (nom_user, prenom_user, email_user, password_user) VALUES (?, ?, ?, ?)';
    db.query(query, [nom_user, prenom_user, email_user, password], (err, results) => {
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
    const { nom_user, prenom_user, email_user, password } = userData;
    const query = 'UPDATE users SET nom_user = ?, prenom_user = ?, email_user = ?, password_user = ? WHERE id_users = ?';
    db.query(query, [nom_user, prenom_user, email_user, password, id], (err, results) => {
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

  static authenticate(email, password, callback) {
    const query = 'SELECT * FROM users WHERE email_user = ? AND password_user = ?';
    db.query(query, [email, password], (err, results) => {
      if (err) {
        return callback(err);
      }
      if (results.length > 0) {
        callback(null, results[0]);
      } else {
        callback(new Error('Invalid email or password'));
      }
    });
  }
}

module.exports = User;
