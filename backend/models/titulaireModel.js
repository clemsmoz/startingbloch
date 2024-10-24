const db = require('../config/dbconfig');

class Titulaire {
  constructor(nom_titulaire, prenom_titulaire, email_titulaire, telephone_titulaire) {
    this.nom_titulaire = nom_titulaire;
    this.prenom_titulaire = prenom_titulaire;
    this.email_titulaire = email_titulaire;
    this.telephone_titulaire = telephone_titulaire;
  }

  static create(titulaireData, callback) {
    const { nom_titulaire, prenom_titulaire, email_titulaire, telephone_titulaire } = titulaireData;
    const query = 'INSERT INTO titulaire (nom_titulaire, prenom_titulaire, email_titulaire, telephone_titulaire) VALUES (?, ?, ?, ?)';
    db.query(query, [nom_titulaire, prenom_titulaire, email_titulaire, telephone_titulaire], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  static getAll(callback) {
    const query = 'SELECT * FROM titulaire';
    db.query(query, (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM titulaire WHERE id_titulaire = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results[0]);
    });
  }

  static update(id, titulaireData, callback) {
    // Récupérer les données actuelles du titulaire
    const selectSql = 'SELECT * FROM titulaire WHERE id_titulaire = ?';
    db.query(selectSql, [id], (err, existingData) => {
      if (err) return callback(err);
  
      if (existingData.length === 0) {
        return callback(new Error('Titulaire not found'));
      }
  
      const currentTitulaire = existingData[0];
      const fieldsToUpdate = [];
      const valuesToUpdate = [];
  
      // Comparer chaque champ et ne mettre à jour que ceux qui ont changé
      if (titulaireData.nom_titulaire && titulaireData.nom_titulaire !== currentTitulaire.nom_titulaire) {
        fieldsToUpdate.push('nom_titulaire = ?');
        valuesToUpdate.push(titulaireData.nom_titulaire);
      }
      if (titulaireData.prenom_titulaire && titulaireData.prenom_titulaire !== currentTitulaire.prenom_titulaire) {
        fieldsToUpdate.push('prenom_titulaire = ?');
        valuesToUpdate.push(titulaireData.prenom_titulaire);
      }
      if (titulaireData.email_titulaire && titulaireData.email_titulaire !== currentTitulaire.email_titulaire) {
        fieldsToUpdate.push('email_titulaire = ?');
        valuesToUpdate.push(titulaireData.email_titulaire);
      }
      if (titulaireData.telephone_titulaire && titulaireData.telephone_titulaire !== currentTitulaire.telephone_titulaire) {
        fieldsToUpdate.push('telephone_titulaire = ?');
        valuesToUpdate.push(titulaireData.telephone_titulaire);
      }
  
      // Si aucun champ n'a été modifié, on arrête ici
      if (fieldsToUpdate.length === 0) {
        return callback(null, 'No changes detected');
      }
  
      // Construction dynamique de la requête SQL
      const updateSql = `UPDATE titulaire SET ${fieldsToUpdate.join(', ')} WHERE id_titulaire = ?`;
      valuesToUpdate.push(id);
  
      // Exécution de la requête de mise à jour
      db.query(updateSql, valuesToUpdate, (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    });
  }
  

  static delete(id, callback) {
    const query = 'DELETE FROM titulaire WHERE id_titulaire = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  static getByIds(ids, callback) {
    const sql = `SELECT * FROM titulaire WHERE id_titulaire IN (?)`;
    db.query(sql, [ids], (err, results) => {
      if (err) {
        return callback(err);
      }
      return callback(null, results);
    });
  }
}

module.exports = Titulaire;
