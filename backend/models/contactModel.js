// const db = require('../config/dbconfig');

// class Contact {
//   static getFiltered(query, callback) {
//     db.query(query, (err, results) => {
//       if (err) {
//         return callback(err);
//       }
//       callback(null, results);
//     });
//   }

//   static create(contactData, callback) {
//     const { nom_contact, prenom_contact, telephone_contact, email_contact, id_cabinet_annuite, id_cabinet_procedure } = contactData;
//     const query = 'INSERT INTO contact (nom_contact, prenom_contact, telephone_contact, email_contact, id_cabinet_annuite, id_cabinet_procedure) VALUES (?, ?, ?, ?, ?, ?)';
//     db.query(query, [nom_contact, prenom_contact, telephone_contact, email_contact, id_cabinet_annuite, id_cabinet_procedure], (err, results) => {
//       if (err) {
//         return callback(err);
//       }
//       callback(null, results);
//     });
//   }

//   static update(id, contactData, callback) {
//     const { nom_contact, prenom_contact, telephone_contact, email_contact } = contactData;
//     const query = 'UPDATE contact SET nom_contact = ?, prenom_contact = ?, telephone_contact = ?, email_contact = ? WHERE id_contact = ?';
//     db.query(query, [nom_contact, prenom_contact, telephone_contact, email_contact, id], (err, results) => {
//       if (err) {
//         return callback(err);
//       }
//       callback(null, results);
//     });
//   }

//   static delete(id, callback) {
//     const query = 'DELETE FROM contact WHERE id_contact = ?';
//     db.query(query, [id], (err, results) => {
//       if (err) {
//         return callback(err);
//       }
//       callback(null, results);
//     });
//   }
// }

// module.exports = Contact;


const db = require('../config/dbconfig');

class Contact {
  // Création d'un nouveau contact pour un cabinet
  static createForCabinet(contactData, callback) {
    const sql = `
      INSERT INTO contact_cabinet (id_cabinet, nom, prenom, fonction, email, telephone)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      contactData.id_cabinet, contactData.nom, contactData.prenom,
      contactData.fonction, contactData.email, contactData.telephone
    ];

    console.log("Executing SQL query:", sql, "with values:", values);
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("SQL error:", err);
        return callback(err);
      }
      console.log("SQL query result:", result);
      callback(null, result.insertId);
    });
  }

  // Récupération de tous les contacts pour un cabinet spécifique
  static getByCabinetId(idCabinet, callback) {
    const sql = 'SELECT * FROM contact_cabinet WHERE id_cabinet = ?';

    console.log("Executing SQL query:", sql, "with idCabinet:", idCabinet);
    db.query(sql, [idCabinet], (err, results) => {
      if (err) {
        console.error("SQL error:", err);
        return callback(err);
      }
      console.log("SQL query result:", results);
      callback(null, results);
    });
  }

  // Mise à jour d'un contact pour un cabinet spécifique
  static updateForCabinet(id, contactData, callback) {
    // Récupérer les données actuelles du contact
    const selectSql = 'SELECT * FROM contact_cabinet WHERE id_contact = ?';
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
      const updateSql = `UPDATE contact_cabinet SET ${fieldsToUpdate.join(', ')} WHERE id_contact = ?`;
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
  
  // Suppression d'un contact pour un cabinet spécifique
  static deleteFromCabinet(id, callback) {
    const sql = 'DELETE FROM contact_cabinet WHERE id_contact = ?';

    console.log("Executing SQL query:", sql, "with id:", id);
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("SQL error:", err);
        return callback(err);
      }
      console.log("SQL query result:", result);
      callback(null, result.affectedRows);
    });
  }

  // Méthodes similaires pour les contacts des clients
  static createForClient(contactData, callback) {
    const sql = `
      INSERT INTO contact_client (id_client, nom, prenom, fonction, email, telephone)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      contactData.id_client, contactData.nom, contactData.prenom,
      contactData.fonction, contactData.email, contactData.telephone
    ];

    console.log("Executing SQL query:", sql, "with values:", values);
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("SQL error:", err);
        return callback(err);
      }
      console.log("SQL query result:", result);
      callback(null, result.insertId);
    });
  }



  static getByClientId(idClient, callback) {
    const sql = 'SELECT * FROM contact_client WHERE id_client = ?';
    console.log("Executing SQL query:", sql, "with idClient:", idClient);
    db.query(sql, [idClient], (err, results) => {
      if (err) {
        console.error("SQL error:", err);
        return callback(err);
      }
      console.log("SQL query result:", results);
      callback(null, results);
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
  



  static deleteFromClient(id, callback) {
    const sql = 'DELETE FROM contact_client WHERE id_contact = ?';

    console.log("Executing SQL query:", sql, "with id:", id);
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("SQL error:", err);
        return callback(err);
      }
      console.log("SQL query result:", result);
      callback(null, result.affectedRows);
    });
  }
}

module.exports = Contact;
