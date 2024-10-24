const db = require('../config/dbconfig');

class Inventeur {
  constructor(nom_inventeur, prenom_inventeur, email_inventeur, telephone_inventeur) {
    this.nom_inventeur = nom_inventeur;
    this.prenom_inventeur = prenom_inventeur;
    this.email_inventeur = email_inventeur;
    this.telephone_inventeur = telephone_inventeur;
  }

  static create(inventeurData, callback) {
    const { nom_inventeur, prenom_inventeur, email_inventeur, telephone_inventeur } = inventeurData;
    const query = 'INSERT INTO inventeurs (nom_inventeur, prenom_inventeur, email_inventeur, telephone_inventeur) VALUES (?, ?, ?, ?)';
    db.query(query, [nom_inventeur, prenom_inventeur, email_inventeur, telephone_inventeur], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  static getAll(callback) {
    const query = 'SELECT * FROM inventeurs';
    db.query(query, (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }


static getByIds(ids, callback) {
  const sql = `SELECT * FROM inventeur WHERE id_inventeur IN (?)`;
  db.query(sql, [ids], (err, results) => {
    if (err) {
      return callback(err);
    }
    return callback(null, results);
  });
}

  

  static getById(id, callback) {
    const query = 'SELECT * FROM inventeurs WHERE id_inventeurs = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results[0]);
    });
  }

  static updateForClient(id, contactData, callback) {
    // Récupérer les données actuelles du contact
    const selectSql = 'SELECT * FROM contact_client WHERE id_contact = ?';
    db.query(selectSql, [id], (err, existingData) => {
      if (err) return callback(err);
  
      if (existingData.length === 0) {
        return callback(new Error('Contact not found'));
      }
  
      const currentContact = existingData[0];
      const fieldsToUpdate = [];
      const valuesToUpdate = [];
  
      // Comparer chaque champ et ne mettre à jour que ceux qui ont changé
      if (contactData.nom && contactData.nom !== currentContact.nom) {
        fieldsToUpdate.push('nom = ?');
        valuesToUpdate.push(contactData.nom);
      }
      if (contactData.prenom && contactData.prenom !== currentContact.prenom) {
        fieldsToUpdate.push('prenom = ?');
        valuesToUpdate.push(contactData.prenom);
      }
      if (contactData.fonction && contactData.fonction !== currentContact.fonction) {
        fieldsToUpdate.push('fonction = ?');
        valuesToUpdate.push(contactData.fonction);
      }
      if (contactData.email && contactData.email !== currentContact.email) {
        fieldsToUpdate.push('email = ?');
        valuesToUpdate.push(contactData.email);
      }
      if (contactData.telephone && contactData.telephone !== currentContact.telephone) {
        fieldsToUpdate.push('telephone = ?');
        valuesToUpdate.push(contactData.telephone);
      }
  
      // Si aucun champ n'a été modifié, on arrête ici
      if (fieldsToUpdate.length === 0) {
        return callback(null, 'No changes detected');
      }
  
      // Construction dynamique de la requête SQL
      const updateSql = `UPDATE contact_client SET ${fieldsToUpdate.join(', ')} WHERE id_contact = ?`;
      valuesToUpdate.push(id);
  
      // Exécution de la requête de mise à jour
      console.log("Executing SQL query:", updateSql, "with values:", valuesToUpdate);
      db.query(updateSql, valuesToUpdate, (err, result) => {
        if (err) {
          console.error("SQL error:", err);
          return callback(err);
        }
        console.log("SQL query result:", result);
        callback(null, result.affectedRows);
      });
    });
  }
  

  static delete(id, callback) {
    const query = 'DELETE FROM inventeurs WHERE id_inventeurs = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }
}

module.exports = Inventeur;
