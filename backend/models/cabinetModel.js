const db = require('../config/dbconfig');
const async = require('async');

class Cabinet {

  // Création d'un nouveau cabinet avec ses contacts
  static create(cabinetData, callback) {
    const cabinetSql = `
      INSERT INTO cabinet (nom_cabinet, email_cabinet, telephone_cabinet, reference_cabinet, type) VALUES (?, ?, ?, ?, ?)
    `;
    const cabinetValues = [
      cabinetData.nom,
      cabinetData.email,
      cabinetData.telephone,
      cabinetData.reference,
      cabinetData.type,
      cabinetData.pays
    ];
  
    db.query(cabinetSql, cabinetValues, (err, result) => {
      if (err) {
        return callback(err);
      }
  
      const cabinetId = result.insertId;
  
      // Insertion dans la table `contact_cabinet` (si des contacts sont spécifiés)
      if (cabinetData.contacts && cabinetData.contacts.length > 0) {
        const contactValues = cabinetData.contacts.map(contact => [
          cabinetId, contact.nom, contact.prenom, contact.fonction, contact.email, contact.telephone
        ]);
  
        db.query(
          'INSERT INTO contact_cabinet (id_cabinet, nom, prenom, fonction, email, telephone) VALUES ?',
          [contactValues],
          (err) => {
            if (err) return callback(err);
          }
        );
      }
  
      // Insertion dans la table relationnelle `cabinet_pays`
      if (cabinetData.pays && cabinetData.pays.length > 0) {
        const paysValues = cabinetData.pays.map(paysId => [cabinetId, paysId]);
      
        db.query(
          'INSERT INTO cabinet_pays (id_cabinet, id_pays) VALUES ?',
          [paysValues],
          (err) => {
            if (err) return callback(err);
          }
        );
      }
      
  
      // Retourner l'ID du cabinet créé
      callback(null, cabinetId);
    });
  }
  

  
  // Récupération de tous les cabinets
  static getAll(callback) {
    const sql = `
      SELECT 
        c.id_cabinet,
        c.nom_cabinet,
        c.email_cabinet,
        c.telephone_cabinet,
        c.reference_cabinet,
        c.type,
        GROUP_CONCAT(p.nom_fr_fr) AS pays
      FROM 
        cabinet c
      LEFT JOIN 
        cabinet_pays cp ON c.id_cabinet = cp.id_cabinet
      LEFT JOIN 
        pays p ON cp.id_pays = p.id_pays
      GROUP BY 
        c.id_cabinet
    `;
    
    db.query(sql, (err, results) => {
      if (err) {
        return callback(err);
      }
  
      // Transformer la liste des pays en tableau (si nécessaire)
      const formattedResults = results.map(cabinet => ({
        ...cabinet,
        pays: cabinet.pays ? cabinet.pays.split(',') : []
      }));
  
      callback(null, formattedResults);
    });
  }
  


    // Suppression d'un cabinet et de ses contacts par ID

  static delete(id, callback) {
    async.parallel([
      (cb) => db.query('DELETE FROM contact_cabinet WHERE id_cabinet = ?', [id], cb),
      (cb) => db.query('DELETE FROM cabinet WHERE id_cabinet = ?', [id], cb)
    ], callback);
  }


  // Récupération d'un cabinet par ID avec ses contacts
  static getById(id, callback) {
    const sql = 'SELECT * FROM cabinet WHERE id_cabinet = ?';
    
    db.query(sql, [id], (err, result) => {
      if (err) {
        return callback(err);
      }

      const cabinet = result[0];

      db.query('SELECT * FROM contact_cabinet WHERE id_cabinet = ?', [id], (err, contacts) => {
        if (err) {
          return callback(err);
        }
        cabinet.contacts = contacts;
        callback(null, cabinet);
      });
    });
  }

  // Mise à jour d'un cabinet et de ses contacts par ID
  static update(id, cabinetData, callback) {
    // Récupérer les données actuelles du cabinet
    const selectSql = 'SELECT * FROM cabinet WHERE id_cabinet = ?';
    db.query(selectSql, [id], (err, existingData) => {
      if (err) return callback(err);
  
      if (existingData.length === 0) {
        return callback(new Error('Cabinet not found'));
      }
  
      const currentCabinet = existingData[0];
      const fieldsToUpdate = [];
      const valuesToUpdate = [];
  
      // Comparer chaque champ et ne mettre à jour que ceux qui ont changé
      if (cabinetData.nom && cabinetData.nom !== currentCabinet.nom) {
        fieldsToUpdate.push('nom = ?');
        valuesToUpdate.push(cabinetData.nom);
      }
      if (cabinetData.reference && cabinetData.reference !== currentCabinet.reference) {
        fieldsToUpdate.push('reference = ?');
        valuesToUpdate.push(cabinetData.reference);
      }
      if (cabinetData.type && cabinetData.type !== currentCabinet.type) {
        fieldsToUpdate.push('type = ?');
        valuesToUpdate.push(cabinetData.type);
      }
  
      // Si aucun champ n'a été modifié, on arrête ici
      if (fieldsToUpdate.length === 0) {
        return callback(null, 'No changes detected');
      }
  
      // Construction dynamique de la requête SQL
      const updateSql = `UPDATE cabinet SET ${fieldsToUpdate.join(', ')} WHERE id_cabinet = ?`;
      valuesToUpdate.push(id);
  
      // Exécution de la requête de mise à jour
      db.query(updateSql, valuesToUpdate, (err, result) => {
        if (err) return callback(err);
  
        // Suppression des anciens contacts et ajout des nouveaux, comme avant
        db.query('DELETE FROM contact_cabinet WHERE id_cabinet = ?', [id], (err) => {
          if (err) return callback(err);
  
          if (cabinetData.contacts && cabinetData.contacts.length > 0) {
            const contactValues = cabinetData.contacts.map(contact => [
              id, contact.nom, contact.prenom, contact.fonction, contact.email, contact.telephone
            ]);
            db.query('INSERT INTO contact_cabinet (id_cabinet, nom, prenom, fonction, email, telephone) VALUES ?', [contactValues], callback);
          } else {
            callback(null, result.affectedRows);
          }
        });
      });
    });
  }
    
    static getByBrevetId(brevetId, callback) {
      const sql = 'SELECT * FROM brevet_cabinet WHERE id_brevet = ?';
      db.query(sql, [brevetId], (err, results) => {
          if (err) {
              return callback(err);
          }
          callback(null, results);
      });
  }

  // Récupérer toutes les références et les ID des brevets dans la table `brevet_cabinet`
  static getAllReferences(callback) {
    const sql = `SELECT id_brevet, reference FROM brevet_cabinet`; // Sélectionner les deux champs

    db.query(sql, (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results); // Retourner les résultats (id_brevet et reference)
    });
  }



}

module.exports = Cabinet;
