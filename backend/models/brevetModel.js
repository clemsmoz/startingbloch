const db = require('../config/dbconfig');
const async = require('async');

class Brevet {

  // Création d'un nouveau brevet avec les relations
  static create(brevetData, callback) {
    // 1. Insertion dans la table `brevet` 
    const brevetSql = `
      INSERT INTO brevet (
        reference_famille, titre, commentaire
      ) VALUES (?, ?, ?)
    `;
    const brevetValues = [
      brevetData.reference_famille || null,
      brevetData.titre || null,
      brevetData.commentaire || null
    ];
    console.log('Executing brevet SQL:', brevetSql);
    console.log('With values:', brevetValues);

    db.query(brevetSql, brevetValues, (err, result) => {
      if (err) {
        console.error('Error during brevet insertion:', err);
        return callback(err);
      }

      const brevetId = result.insertId;
      console.log('Brevet inserted with ID:', brevetId);

      async.parallel([
        // Insertion des clients dans la table relationnelle brevet_client
        (cb) => {
          if (brevetData.clients && brevetData.clients.length > 0) {
            async.each(brevetData.clients, (client, callback) => {
              const brevetClientSql = `INSERT INTO brevet_client (id_brevet, id_client) VALUES (?, ?)`;
              db.query(brevetClientSql, [brevetId, client.id_client], callback);
            }, cb);
          } else {
            cb(null);
          }
        },

        // Insertion des inventeurs
        (cb) => {
          if (brevetData.inventeurs && brevetData.inventeurs.length > 0) {
            async.each(brevetData.inventeurs, (inventeur, callback) => {
              const inventeurSql = 'INSERT INTO inventeur (nom, prenom, email, telephone) VALUES (?, ?, ?, ?)';
              const inventeurValues = [
                inventeur.nom_inventeur || null,
                inventeur.prenom_inventeur || null,
                inventeur.email_inventeur || null,
                inventeur.telephone_inventeur || null
              ];
              db.query(inventeurSql, inventeurValues, (err, result) => {
                if (err) return callback(err);
                const inventeurId = result.insertId;
                db.query('INSERT INTO brevet_inventeur (id_brevet, id_inventeur) VALUES (?, ?)', [brevetId, inventeurId], callback);
              });
            }, cb);
          } else {
            cb(null);
          }
        },

        // Insertion des déposants
        (cb) => {
          if (brevetData.deposants && brevetData.deposants.length > 0) {
            async.each(brevetData.deposants, (deposant, callback) => {
              const deposantSql = 'INSERT INTO deposant (nom, prenom, email, telephone) VALUES (?, ?, ?, ?)';
              const deposantValues = [
                deposant.nom_deposant || null,
                deposant.prenom_deposant || null,
                deposant.email_deposant || null,
                deposant.telephone_deposant || null
              ];
              db.query(deposantSql, deposantValues, (err, result) => {
                if (err) return callback(err);
                const deposantId = result.insertId;
                db.query('INSERT INTO brevet_deposant (id_brevet, id_deposant) VALUES (?, ?)', [brevetId, deposantId], callback);
              });
            }, cb);
          } else {
            cb(null);
          }
        },

        // Insertion des titulaires
        (cb) => {
          if (brevetData.titulaires && brevetData.titulaires.length > 0) {
            async.each(brevetData.titulaires, (titulaire, callback) => {
              const titulaireSql = 'INSERT INTO titulaire (nom, prenom, email, telephone,client_correspondant, executant) VALUES (?, ?, ?, ?, ?, ?)';
              const titulaireValues = [
                titulaire.nom_titulaire || null,
                titulaire.prenom_titulaire || null,
                titulaire.email_titulaire || null,
                titulaire.telephone_titulaire || null,
                titulaire.client_correspondant ? 1 : 0,
                titulaire.executant ? 1 : 0
              ];
              db.query(titulaireSql, titulaireValues, (err, result) => {
                if (err) return callback(err);
                const titulaireId = result.insertId;
                db.query('INSERT INTO brevet_titulaire (id_brevet, id_titulaire) VALUES (?, ?)', [brevetId, titulaireId], callback);
              });
            }, cb);
          } else {
            cb(null);
          }
        },

  


     // Insertion des cabinets_procedure avec les données supplémentaires de pays
(cb) => {
  if (brevetData.cabinets_procedure && brevetData.cabinets_procedure.length > 0) {
    async.each(brevetData.cabinets_procedure, (cabinet, callback) => {
      const paysSql = 'SELECT nom_fr_fr, alpha2 FROM pays WHERE id_pays = ?';
      db.query(paysSql, [cabinet.id_pays], (err, result) => {
        if (err) return callback(err);
        
        const { nom_fr_fr, alpha2 } = result[0] || {}; // Récupère les informations du pays
        console.log('Pays details for cabinet procedure:', nom_fr_fr, alpha2);

        const cabinetProcedureValues = [
          brevetId,
          cabinet.id_cabinet_procedure || null,
          cabinet.reference || null,
          cabinet.dernier_intervenant ? 1 : 0,
          cabinet.id_pays || null,
          cabinet.numero_depot || null,
          cabinet.numero_publication || null,
          nom_fr_fr || null,
          cabinet.id_statuts ? parseInt(cabinet.id_statuts) : null,
          alpha2 || null,
          cabinet.date_depot || null,
          cabinet.numero_delivrance || null,
          cabinet.date_delivrance || null,
          cabinet.licence ? 1 : 0
        ];

        console.log('Inserting cabinets_procedure:', cabinetProcedureValues);

        const insertCabinetProcedureSql = `
          INSERT INTO brevet_cabinet (
            id_brevet,
            id_cabinet,
            reference,
            dernier_intervenant,
            id_pays,
            numero_depot,
            numero_publication,
            nom_fr_fr,
            id_statuts,
            alpha2,
            date_depot,
            numero_delivrance,
            date_delivrance,
            licence
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertCabinetProcedureSql, cabinetProcedureValues, callback);
      });
    }, cb);
  } else {
    cb(null);
  }
},


// Insertion des cabinets_annuite avec les données supplémentaires de pays
(cb) => {
  if (brevetData.cabinets_annuite && brevetData.cabinets_annuite.length > 0) {
    async.each(brevetData.cabinets_annuite, (cabinet, callback) => {
      const paysSql = 'SELECT nom_fr_fr, alpha2 FROM pays WHERE id_pays = ?';
      db.query(paysSql, [cabinet.id_pays], (err, result) => {
        if (err) return callback(err);

        const { nom_fr_fr, alpha2 } = result[0] || {}; // Récupère les informations du pays
        console.log('Pays details for cabinet annuite:', nom_fr_fr, alpha2);

        const cabinetAnnuiteValues = [
          brevetId,
          cabinet.id_cabinet_annuite || null,
          cabinet.reference || null,
          cabinet.dernier_intervenant ? 1 : 0,
          cabinet.id_pays || null,
          cabinet.numero_depot || null,
          cabinet.numero_publication || null,
          nom_fr_fr || null,
          cabinet.id_statuts ? parseInt(cabinet.id_statuts) : null,
          alpha2 || null,
          cabinet.date_depot || null,
          cabinet.numero_delivrance || null,
          cabinet.date_delivrance || null,
          cabinet.licence ? 1 : 0
        ];

        console.log('Inserting cabinets_annuite:', cabinetAnnuiteValues);

        const insertCabinetAnnuiteSql = `
          INSERT INTO brevet_cabinet (
            id_brevet,
            id_cabinet,
            reference,
            dernier_intervenant,
            id_pays,
            numero_depot,
            numero_publication,
            nom_fr_fr,
            id_statuts,
            alpha2,
            date_depot,
            numero_delivrance,
            date_delivrance,
            licence
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertCabinetAnnuiteSql, cabinetAnnuiteValues, callback);
      });
    }, cb);
  } else {
    cb(null);
  }
},


        // Insertion des pièces jointes dans la table relationnelle brevet_pieces_jointes
(cb) => {
  if (brevetData.pieces_jointes && brevetData.pieces_jointes.length > 0) {
    async.each(brevetData.pieces_jointes, (pieceJointe, callback) => {
      const pieceJointeSql = `
        INSERT INTO brevet_pieces_jointes (id_brevet, nom_fichier, type_fichier, donnees)
        VALUES (?, ?, ?, ?)
      `;
      const pieceJointeValues = [
        brevetId,
        pieceJointe.nom_fichier || null,
        pieceJointe.type_fichier || null,
        pieceJointe.donnees || null // Données binaires du fichier
      ];

      console.log('Inserting piece jointe:', pieceJointeValues);

      db.query(pieceJointeSql, pieceJointeValues, (err, result) => {
        if (err) {
          console.error('Error during piece jointe insertion:', err);
          return callback(err);
        }
        console.log('Piece jointe inserted:', result);
        callback(null);
      });
    }, cb);
  } else {
    cb(null); // Aucune pièce jointe à insérer
  }
},

      ], callback); // Fin de async.parallel
    });
  }


  // Suppression d'un brevet et de ses relations par ID
  static delete(id, callback) {
    async.parallel([
      (cb) => db.query('DELETE FROM brevet_inventeur WHERE id_brevet = ?', [id], cb),
      (cb) => db.query('DELETE FROM brevet_deposant WHERE id_brevet = ?', [id], cb),
      (cb) => db.query('DELETE FROM brevet_titulaire WHERE id_brevet = ?', [id], cb),
      (cb) => db.query('DELETE FROM numero_pays WHERE id_brevet = ?', [id], cb),
      (cb) => db.query('DELETE FROM brevet_cabinet WHERE id_brevet = ?', [id], cb),
      (cb) => db.query('DELETE FROM brevet_client WHERE id_brevet = ?', [id], cb),
      (cb) => db.query('DELETE FROM brevet WHERE id_brevet = ?', [id], cb)
    ], callback);
  }

  // Récupération de tous les brevets
  static getAll(callback) {
    const sql = 'SELECT * FROM brevet';
    db.query(sql, (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }

  // Récupération d'un brevet par ID
  static getById(id, callback) {
    const sql = `
      SELECT
        id_brevet,
        reference_famille,
        titre,
        commentaire
      FROM brevet WHERE id_brevet = ?
    `;
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Error during brevet retrieval:', err);
        return callback(err);
      }

      if (result.length === 0) {
        return callback(new Error('Brevet not found'));
      }

      const brevet = result[0];

      async.parallel({
        // Récupération des clients associés
        clients: (cb) => {
          db.query(
            'SELECT c.id_client, c.nom_client FROM brevet_client bc JOIN client c ON bc.id_client = c.id_client WHERE bc.id_brevet = ?',
            [id],
            (err, results) => {
              if (err) {
                console.error('Error retrieving clients:', err);
                return cb(err);
              }
              cb(null, results.map(r => ({
                id_client: r.id_client,
                nom_client: r.nom_client
              })));
            }
          );
        },

        // Récupération des inventeurs associés
        inventeurs: (cb) => {
          db.query(
            'SELECT i.id_inventeur, i.nom, i.prenom FROM brevet_inventeur bi JOIN inventeur i ON bi.id_inventeur = i.id_inventeur WHERE bi.id_brevet = ?',
            [id],
            (err, results) => {
              if (err) {
                console.error('Error retrieving inventeurs:', err);
                return cb(err);
              }
              cb(null, results.map(r => ({
                id_inventeur: r.id_inventeur,
                nom: r.nom,
                prenom: r.prenom
              })));
            }
          );
        },

        // Récupération des déposants associés
        deposants: (cb) => {
          db.query(
            'SELECT d.id_deposant, d.nom FROM brevet_deposant bd JOIN deposant d ON bd.id_deposant = d.id_deposant WHERE bd.id_brevet = ?',
            [id],
            (err, results) => {
              if (err) {
                console.error('Error retrieving deposants:', err);
                return cb(err);
              }
              cb(null, results.map(r => ({
                id_deposant: r.id_deposant,
                nom: r.nom
              })));
              
            }
          );
        },

        // Récupération des titulaires associés
        titulaires: (cb) => {
          db.query(
            'SELECT t.id_titulaire, t.nom FROM brevet_titulaire bt JOIN titulaire t ON bt.id_titulaire = t.id_titulaire WHERE bt.id_brevet = ?',
            [id],
            (err, results) => {
              if (err) {
                console.error('Error retrieving titulaires:', err);
                return cb(err);
              }
              cb(null, results.map(r => ({
                id_titulaire: r.id_titulaire,
                nom: r.nom
              })));
            }
          );
        },


        // Récupération des cabinets associés
        cabinets: (cb) => {
          db.query(
            'SELECT id_cabinet, reference, dernier_intervenant, numero_depot, numero_publication, id_pays, alpha2, id_statuts, date_depot, date_delivrance, licence, nom_fr_fr FROM brevet_cabinet WHERE id_brevet = ?',
            [id],
            (err, results) => {
              if (err) {
                console.error('Error retrieving cabinets:', err);
                return cb(err);
              }
              cb(null, results.map(r => ({
                id_cabinet: r.id_cabinet,
                reference: r.reference,
                dernier_intervenant: !!r.dernier_intervenant,
                numero_depot: r.numero_depot,
                numero_publication: r.numero_publication,
                id_pays: r.id_pays,
                alpha2: r.alpha2,
                id_statuts: r.id_statuts,
                date_depot: r.date_depot,
                date_delivrance: r.date_delivrance,
                licence: r.licence,
                nom_fr_fr: r.nom_fr_fr

              })));
            }
          );
        },

       // Récupération des pièces jointes depuis la table `brevet_pieces_jointes`
       pieces_jointes: (cb) => {
        db.query(
          'SELECT nom_fichier, type_fichier, donnees FROM brevet_pieces_jointes WHERE id_brevet = ?',
          [id],
          (err, results) => {
            if (err) {
              console.error('Erreur lors de la récupération des pièces jointes:', err);
              return cb(err);
            }
            
            // Vérifiez si les résultats sont vides ou non
            if (!Array.isArray(results)) {
              console.warn('Les résultats ne sont pas un tableau:', results);
              return cb(null, []); // Retournez un tableau vide si aucune pièce jointe
            }
      
            // Convertir les données des fichiers en base64
            const fichiers = results.map(result => ({
              nom_fichier: result.nom_fichier,
              type_fichier: result.type_fichier,
              donnees: result.donnees instanceof Buffer ? result.donnees.toString('base64') : null, // Assurez-vous que donnees est un Buffer
            }));
      
            cb(null, fichiers);
          }
        );
      },
      
      

      }, (err, results) => {
        if (err) {
          return callback(err);
        }
        // Assignation des résultats au brevet
        brevet.clients = results.clients;
        brevet.inventeurs = results.inventeurs;
        brevet.deposants = results.deposants;
        brevet.titulaires = results.titulaires;
        brevet.numero_pays = results.numero_pays;
        brevet.cabinets = results.cabinets;
        brevet.pieces_jointes = results.pieces_jointes;

        callback(null, brevet);
      });
    });
  }

  static update(brevetId, updatedData, callback) {
    // 1. Mise à jour de la table principale `brevet`
    const updateBrevetSql = `
      UPDATE brevet SET
        reference_famille = ?,
        titre = ?,
        date_depot = ?,
        numero_delivrance = ?,
        date_delivrance = ?,
        licence = ?,
        commentaire = ?
      WHERE id_brevet = ?
    `;
    const brevetValues = [
      updatedData.reference_famille || null,
      updatedData.titre || null,
      updatedData.date_depot || null,
      updatedData.numero_delivrance || null,
      updatedData.date_delivrance || null,
      updatedData.licence ? 1 : 0,
      updatedData.commentaire || null,
      brevetId
    ];
  
    db.query(updateBrevetSql, brevetValues, (err, result) => {
      if (err) {
        console.error('Error during brevet update:', err);
        return callback(err);
      }
  
      async.parallel([
        // Mise à jour des clients
        (cb) => {
          db.query('DELETE FROM brevet_client WHERE id_brevet = ?', [brevetId], (err) => {
            if (err) return cb(err);
            if (updatedData.clients && updatedData.clients.length > 0) {
              async.each(updatedData.clients, (client, callback) => {
                const insertClientSql = `INSERT INTO brevet_client (id_brevet, id_client) VALUES (?, ?)`;
                db.query(insertClientSql, [brevetId, client.id_client], callback);
              }, cb);
            } else {
              cb(null);
            }
          });
        },
  
        // Mise à jour des inventeurs
        (cb) => {
          db.query('DELETE FROM brevet_inventeur WHERE id_brevet = ?', [brevetId], (err) => {
            if (err) return cb(err);
            if (updatedData.inventeurs && updatedData.inventeurs.length > 0) {
              async.each(updatedData.inventeurs, (inventeur, callback) => {
                const insertInventeurSql = `
                  INSERT INTO inventeur (nom, prenom, email, telephone)
                  VALUES (?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE nom = VALUES(nom), prenom = VALUES(prenom), email = VALUES(email), telephone = VALUES(telephone)
                `;
                const inventeurValues = [
                  inventeur.nom_inventeur || null,
                  inventeur.prenom_inventeur || null,
                  inventeur.email_inventeur || null,
                  inventeur.telephone_inventeur || null
                ];
                db.query(insertInventeurSql, inventeurValues, (err, result) => {
                  if (err) return callback(err);
                  const inventeurId = result.insertId || inventeur.id_inventeur;
                  db.query('INSERT INTO brevet_inventeur (id_brevet, id_inventeur) VALUES (?, ?) ON DUPLICATE KEY UPDATE id_inventeur = VALUES(id_inventeur)', [brevetId, inventeurId], callback);
                });
              }, cb);
            } else {
              cb(null);
            }
          });
        },
  
        // Mise à jour des déposants
        (cb) => {
          db.query('DELETE FROM brevet_deposant WHERE id_brevet = ?', [brevetId], (err) => {
            if (err) return cb(err);
            if (updatedData.deposants && updatedData.deposants.length > 0) {
              async.each(updatedData.deposants, (deposant, callback) => {
                const insertDeposantSql = `
                  INSERT INTO deposant (nom, prenom, email, telephone)
                  VALUES (?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE nom = VALUES(nom), prenom = VALUES(prenom), email = VALUES(email), telephone = VALUES(telephone)
                `;
                const deposantValues = [
                  deposant.nom_deposant || null,
                  deposant.prenom_deposant || null,
                  deposant.email_deposant || null,
                  deposant.telephone_deposant || null
                ];
                db.query(insertDeposantSql, deposantValues, (err, result) => {
                  if (err) return callback(err);
                  const deposantId = result.insertId || deposant.id_deposant;
                  db.query('INSERT INTO brevet_deposant (id_brevet, id_deposant) VALUES (?, ?) ON DUPLICATE KEY UPDATE id_deposant = VALUES(id_deposant)', [brevetId, deposantId], callback);
                });
              }, cb);
            } else {
              cb(null);
            }
          });
        },
  
        // Mise à jour des titulaires
        (cb) => {
          db.query('DELETE FROM brevet_titulaire WHERE id_brevet = ?', [brevetId], (err) => {
            if (err) return cb(err);
            if (updatedData.titulaires && updatedData.titulaires.length > 0) {
              async.each(updatedData.titulaires, (titulaire, callback) => {
                const insertTitulaireSql = `
                  INSERT INTO titulaire (nom, prenom, email, telephone, part_pi, client_correspondant, executant)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE nom = VALUES(nom), prenom = VALUES(prenom), email = VALUES(email), telephone = VALUES(telephone), part_pi = VALUES(part_pi), client_correspondant = VALUES(client_correspondant), executant = VALUES(executant)
                `;
                const titulaireValues = [
                  titulaire.nom_titulaire || null,
                  titulaire.prenom_titulaire || null,
                  titulaire.email_titulaire || null,
                  titulaire.telephone_titulaire || null,
                  titulaire.part_pi || null,
                  titulaire.client_correspondant ? 1 : 0,
                  titulaire.executant ? 1 : 0
                ];
                db.query(insertTitulaireSql, titulaireValues, (err, result) => {
                  if (err) return callback(err);
                  const titulaireId = result.insertId || titulaire.id_titulaire;
                  db.query('INSERT INTO brevet_titulaire (id_brevet, id_titulaire) VALUES (?, ?) ON DUPLICATE KEY UPDATE id_titulaire = VALUES(id_titulaire)', [brevetId, titulaireId], callback);
                });
              }, cb);
            } else {
              cb(null);
            }
          });
        },
  
        // Mise à jour des numéros de pays
        (cb) => {
          db.query('DELETE FROM numero_pays WHERE id_brevet = ?', [brevetId], (err) => {
            if (err) return cb(err);
            if (updatedData.pays && updatedData.pays.length > 0) {
              async.each(updatedData.pays, (paysData, callback) => {
                const insertNumeroPaysSql = `
                  INSERT INTO numero_pays (id_brevet, id_pays, numero_depot, numero_publication, id_statuts)
                  VALUES (?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE numero_depot = VALUES(numero_depot), numero_publication = VALUES(numero_publication), id_statuts = VALUES(id_statuts)
                `;
                const numeroPaysValues = [
                  brevetId,
                  paysData.id_pays || null,
                  paysData.numero_depot || null,
                  paysData.numero_publication || null,
                  paysData.id_statuts ? parseInt(paysData.id_statuts) : null
                ];
                db.query(insertNumeroPaysSql, numeroPaysValues, callback);
              }, cb);
            } else {
              cb(null);
            }
          });
        },
  
        // Mise à jour des cabinets_procedure
        (cb) => {
          db.query('DELETE FROM brevet_cabinet WHERE id_brevet = ?', [brevetId], (err) => {
            if (err) return cb(err);
            if (updatedData.cabinets_procedure && updatedData.cabinets_procedure.length > 0) {
              async.each(updatedData.cabinets_procedure, (cabinet, callback) => {
                const insertCabinetProcedureSql = `
                  INSERT INTO brevet_cabinet (id_brevet, id_cabinet, reference, dernier_intervenant)
                  VALUES (?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE reference = VALUES(reference), dernier_intervenant = VALUES(dernier_intervenant)
                `;
                const cabinetValues = [
                  brevetId,
                  cabinet.id_cabinet_procedure || null,
                  cabinet.reference || null,
                  cabinet.dernier_intervenant ? 1 : 0
                ];
                db.query(insertCabinetProcedureSql, cabinetValues, callback);
              }, cb);
            } else {
              cb(null);
            }
          });
        },
  
        // Mise à jour des cabinets_annuite
        (cb) => {
          db.query('DELETE FROM brevet_cabinet WHERE id_brevet = ?', [brevetId], (err) => {
            if (err) return cb(err);
            if (updatedData.cabinets_annuite && updatedData.cabinets_annuite.length > 0) {
              async.each(updatedData.cabinets_annuite, (cabinet, callback) => {
                const insertCabinetAnnuiteSql = `
                  INSERT INTO brevet_cabinet (id_brevet, id_cabinet, reference, dernier_intervenant)
                  VALUES (?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE reference = VALUES(reference), dernier_intervenant = VALUES(dernier_intervenant)
                `;
                const cabinetValues = [
                  brevetId,
                  cabinet.id_cabinet_annuite || null,
                  cabinet.reference || null,
                  cabinet.dernier_intervenant ? 1 : 0
                ];
                db.query(insertCabinetAnnuiteSql, cabinetValues, callback);
              }, cb);
            } else {
              cb(null);
            }
          });
        },
  
        // Mise à jour des pièces jointes
        (cb) => {
          db.query('DELETE FROM brevet_pieces_jointes WHERE id_brevet = ?', [brevetId], (err) => {
            if (err) return cb(err);
            if (updatedData.pieces_jointes && updatedData.pieces_jointes.length > 0) {
              async.each(updatedData.pieces_jointes, (pieceJointe, callback) => {
                const pieceJointeSql = `
                  INSERT INTO brevet_pieces_jointes (id_brevet, nom_fichier, type_fichier, donnees)
                  VALUES (?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE nom_fichier = VALUES(nom_fichier), type_fichier = VALUES(type_fichier), donnees = VALUES(donnees)
                `;
                const pieceJointeValues = [
                  brevetId,
                  pieceJointe.nom_fichier || null,
                  pieceJointe.type_fichier || null,
                  pieceJointe.donnees || null
                ];
                db.query(pieceJointeSql, pieceJointeValues, callback);
              }, cb);
            } else {
              cb(null);
            }
          });
        }
  
      ], (err) => {
        if (err) {
          console.error('Error updating related data:', err);
          return callback(err);
        }
        callback(null, { message: 'Brevet updated successfully' });
      });
    });
  }
  

  // Autres méthodes pour récupérer les inventeurs, déposants, titulaires, etc.
  static getInventeursByBrevetId(brevetId, callback) {
    const query = `
      SELECT i.id_inventeur, i.nom, i.prenom, i.email, i.telephone 
      FROM inventeur i
      JOIN brevet_inventeur bi ON i.id_inventeur = bi.id_inventeur
      WHERE bi.id_brevet = ?
    `;
    db.query(query, [brevetId], callback);
  }

  static getDeposantsByBrevetId(brevetId, callback) {
    const query = `
      SELECT d.id_deposant, d.nom, d.prenom, d.email, d.telephone 
      FROM deposant d
      JOIN brevet_deposant bd ON d.id_deposant = bd.id_deposant
      WHERE bd.id_brevet = ?
    `;
    db.query(query, [brevetId], callback);
  }

  static getTitulairesByBrevetId(brevetId, callback) {
    const query = `
      SELECT t.id_titulaire, t.nom, t.prenom, t.email, t.telephone, t.part_pi, t.executant, t.client_correspondant 
      FROM titulaire t
      JOIN brevet_titulaire bt ON t.id_titulaire = bt.id_titulaire
      WHERE bt.id_brevet = ?
    `;
    db.query(query, [brevetId], callback);
  }

  static getCabinetsByBrevetId(brevetId, callback) {
    const query = `
      SELECT c.id_cabinet, c.nom_cabinet, bc.reference, bc.dernier_intervenant 
      FROM cabinet c
      JOIN brevet_cabinet bc ON c.id_cabinet = bc.id_cabinet
      WHERE bc.id_brevet = ?
    `;
    db.query(query, [brevetId], callback);
  }

  static getByClientId(clientId, callback) {
    const sql = `
      SELECT b.*, c.nom_client 
      FROM brevet_client bc 
      JOIN brevet b ON bc.id_brevet = b.id_brevet
      JOIN client c ON bc.id_client = c.id_client 
      WHERE bc.id_client = ?
    `;
    db.query(sql, [clientId], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }
}

module.exports = Brevet;
