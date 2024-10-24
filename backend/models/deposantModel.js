const db = require('../config/dbconfig');

class Deposant {
  constructor(nom_deposant, prenom_deposant, email_deposant, telephone_deposant) {
    this.nom_deposant = nom_deposant;
    this.prenom_deposant = prenom_deposant;
    this.email_deposant = email_deposant;
    this.telephone_deposant = telephone_deposant;
  }

  static create(deposantData, callback) {
    const { nom_deposant, prenom_deposant, email_deposant, telephone_deposant } = deposantData;
    const query = 'INSERT INTO deposants (nom_deposant, prenom_deposant, email_deposant, telephone_deposant) VALUES (?, ?, ?, ?)';
    db.query(query, [nom_deposant, prenom_deposant, email_deposant, telephone_deposant], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  static getAll(callback) {
    const query = 'SELECT * FROM deposants';
    db.query(query, (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM deposants WHERE id_deposants = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results[0]);
    });
  }

  static update(id, deposantData, callback) {
    // Récupérer les données actuelles du déposant
    const selectSql = 'SELECT * FROM deposants WHERE id_deposants = ?';
    db.query(selectSql, [id], (err, existingData) => {
      if (err) return callback(err);
  
      if (existingData.length === 0) {
        return callback(new Error('Deposant not found'));
      }
  
      const currentDeposant = existingData[0];
      const fieldsToUpdate = [];
      const valuesToUpdate = [];
  
      // Comparer chaque champ et ne mettre à jour que ceux qui ont changé
      if (deposantData.nom_deposant && deposantData.nom_deposant !== currentDeposant.nom_deposant) {
        fieldsToUpdate.push('nom_deposant = ?');
        valuesToUpdate.push(deposantData.nom_deposant);
      }
      if (deposantData.prenom_deposant && deposantData.prenom_deposant !== currentDeposant.prenom_deposant) {
        fieldsToUpdate.push('prenom_deposant = ?');
        valuesToUpdate.push(deposantData.prenom_deposant);
      }
      if (deposantData.email_deposant && deposantData.email_deposant !== currentDeposant.email_deposant) {
        fieldsToUpdate.push('email_deposant = ?');
        valuesToUpdate.push(deposantData.email_deposant);
      }
      if (deposantData.telephone_deposant && deposantData.telephone_deposant !== currentDeposant.telephone_deposant) {
        fieldsToUpdate.push('telephone_deposant = ?');
        valuesToUpdate.push(deposantData.telephone_deposant);
      }
  
      // Si aucun champ n'a été modifié, on arrête ici
      if (fieldsToUpdate.length === 0) {
        return callback(null, 'No changes detected');
      }
  
      // Construction dynamique de la requête SQL
      const updateSql = `UPDATE deposants SET ${fieldsToUpdate.join(', ')} WHERE id_deposants = ?`;
      valuesToUpdate.push(id);
  
      // Exécution de la requête de mise à jour
      db.query(updateSql, valuesToUpdate, (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    });
  }
  

  static delete(id, callback) {
    const query = 'DELETE FROM deposants WHERE id_deposants = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  static getByIds(ids, callback) {
    const sql = `SELECT * FROM deposant WHERE id_deposant IN (?)`;
    db.query(sql, [ids], (err, results) => {
      if (err) {
        return callback(err);
      }
      return callback(null, results);
    });
  }

}

module.exports = Deposant;
