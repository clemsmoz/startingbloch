

const db = require('../config/dbconfig');


class Client {
  static create(clientData, callback) {
    const clientSql = `
      INSERT INTO client (nom_client, reference_client, adresse_client, code_postal, pays_client, email_client, telephone_client)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const clientValues = [
      clientData.nom_client || null,
      clientData.reference_client || null,
      clientData.adresse_client || null,
      clientData.code_postal || null,
      clientData.pays_client || null,
      clientData.email_client || null,
      clientData.telephone_client || null
    ];

    db.query(clientSql, clientValues, (err, result) => {
      if (err) {
        return callback(err);
      }

      const clientId = result.insertId;

      if (clientData.contacts && clientData.contacts.length > 0) {
        const contactValues = clientData.contacts.map(contact => [
          clientId, contact.nom || null, contact.prenom || null, contact.fonction || null, contact.email || null, contact.telephone || null
        ]);
        db.query('INSERT INTO contact_client (id_client, nom, prenom, fonction, email, telephone) VALUES ?', [contactValues], callback);
      } else {
        callback(null, clientId);
      }
    });
}



  // Suppression d'un client et de ses contacts par ID
  static delete(id, callback) {
    async.parallel([
      (cb) => db.query('DELETE FROM contact_client WHERE id_client = ?', [id], cb),
      (cb) => db.query('DELETE FROM client WHERE id_client = ?', [id], cb)
    ], callback);
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM client';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching clients:', err);  // Afficher l'erreur si elle existe
            return callback(err);
        }

        console.log('Clients fetched successfully:', results);  // Afficher les résultats pour vérifier

        if (results.length === 0) {
            console.log('No clients found in the database.');  // S'assurer que la table n'est pas vide
        }

        callback(null, results);
    });
}


  // Récupération d'un client par ID avec ses contacts
  static getById(id, callback) {
    const sql = 'SELECT * FROM client WHERE id_client = ?';

    db.query(sql, [id], (err, result) => {
      if (err) {
        return callback(err);
      }

      const client = result[0];

      db.query('SELECT * FROM contact_client WHERE id_client = ?', [id], (err, contacts) => {
        if (err) {
          return callback(err);
        }
        client.contacts = contacts;
        callback(null, client);
      });
    });
  }

  // Mise à jour d'un client et de ses contacts par ID
  static update(id, clientData, callback) {
    // D'abord, récupérer les données actuelles du client
    const selectSql = 'SELECT * FROM client WHERE id_client = ?';
    db.query(selectSql, [id], (err, existingData) => {
      if (err) return callback(err);
  
      if (existingData.length === 0) {
        return callback(new Error('Client not found'));
      }
  
      const currentClient = existingData[0];
      const fieldsToUpdate = [];
      const valuesToUpdate = [];
  
      // Comparer chaque champ et ne mettre à jour que ceux qui ont changé
      if (clientData.nom_client && clientData.nom_client !== currentClient.nom_client) {
        fieldsToUpdate.push('nom_client = ?');
        valuesToUpdate.push(clientData.nom_client);
      }
      if (clientData.reference_client && clientData.reference_client !== currentClient.reference_client) {
        fieldsToUpdate.push('reference_client = ?');
        valuesToUpdate.push(clientData.reference_client);
      }
      if (clientData.adresse_client && clientData.adresse_client !== currentClient.adresse_client) {
        fieldsToUpdate.push('adresse_client = ?');
        valuesToUpdate.push(clientData.adresse_client);
      }
      if (clientData.code_postal && clientData.code_postal !== currentClient.code_postal) {
        fieldsToUpdate.push('code_postal = ?');
        valuesToUpdate.push(clientData.code_postal);
      }
      if (clientData.email_client && clientData.email_client !== currentClient.email_client) {
        fieldsToUpdate.push('email_client = ?');
        valuesToUpdate.push(clientData.email_client);
      }
      if (clientData.telephone_client && clientData.telephone_client !== currentClient.telephone_client) {
        fieldsToUpdate.push('telephone_client = ?');
        valuesToUpdate.push(clientData.telephone_client);
      }
  
      // Si aucun champ n'a été modifié, on arrête ici
      if (fieldsToUpdate.length === 0) {
        return callback(null, 'No changes detected');
      }
  
      // Construction dynamique de la requête SQL
      const updateSql = `UPDATE client SET ${fieldsToUpdate.join(', ')} WHERE id_client = ?`;
      valuesToUpdate.push(id);
  
      // Exécution de la requête de mise à jour
      db.query(updateSql, valuesToUpdate, (err, result) => {
        if (err) return callback(err);
  
        // Suppression des anciens contacts et ajout des nouveaux, comme avant
        db.query('DELETE FROM contact_client WHERE id_client = ?', [id], (err) => {
          if (err) return callback(err);
  
          if (clientData.contacts && clientData.contacts.length > 0) {
            const contactValues = clientData.contacts.map(contact => [
              id, contact.nom, contact.prenom, contact.fonction, contact.email, contact.telephone
            ]);
            db.query('INSERT INTO contact_client (id_client, nom, prenom, fonction, email, telephone) VALUES ?', [contactValues], callback);
          } else {
            callback(null, result.affectedRows);
          }
        });
      });
    });
  }
  



static getClientsByBrevetId(brevetId, callback) {
  const sql = `
    SELECT c.*
    FROM client c
    JOIN brevet_client bc ON c.id_client = bc.id_client
    WHERE bc.id_brevet = ?
  `;
  
  db.query(sql, [brevetId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des clients associés au brevet:', err);
      return callback(err);
    }
    callback(null, results);
  });
}


}


module.exports = Client;
