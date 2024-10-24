const db = require('../config/dbconfig');
const async = require('async');

class Brevet {

  // Création d'un nouveau brevet avec les relations


  static create(brevetData, callback) {
    // 1. Insertion dans la table `brevet` sans les champs de pièces jointes
    const brevetSql = `
      INSERT INTO brevet (
        reference_famille, titre, date_depot, numero_delivrance,
        date_delivrance, licence, id_statuts, commentaire
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const brevetValues = [
      brevetData.reference_famille || null,
      brevetData.titre || null,
      brevetData.date_depot || null,
      brevetData.numero_delivrance || null,
      brevetData.date_delivrance || null,
      brevetData.licence ? 1 : 0,
      parseInt(brevetData.id_statuts) || null,
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
          console.log("Starting client insertion...");
          console.log('brevetData.clients:', brevetData.clients);

          if (brevetData.clients && brevetData.clients.length > 0) {
            console.log("Clients found for insertion:", brevetData.clients);

            async.each(brevetData.clients, (client, callback) => {
              console.log("Inserting client with ID:", client.id_client);

              const brevetClientSql = `INSERT INTO brevet_client (id_brevet, id_client) VALUES (?, ?)`;
              db.query(brevetClientSql, [brevetId, client.id_client], (err, result) => {
                if (err) {
                  console.error('Error during brevet_client insertion:', err);
                  return callback(err);
                }
                console.log('Client inserted into brevet_client with brevet ID:', brevetId, 'and client ID:', client.id_client);
                callback(null);
              });
            }, (err) => {
              if (err) {
                console.error('Error inserting clients:', err);
                return cb(err);
              }
              console.log('All clients successfully inserted into brevet_client for brevet ID:', brevetId);
              cb(null);
            });
          } else {
            console.log('No clients to insert. Skipping client insertion step.');
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
              console.log('Inserting inventeur:', inventeurValues);

              db.query(inventeurSql, inventeurValues, (err, result) => {
                if (err) {
                  console.error('Error during inventeur insertion:', err);
                  return callback(err);
                }
                const inventeurId = result.insertId;
                console.log('Inventeur inserted with ID:', inventeurId);

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
              console.log('Inserting deposant:', deposantValues);

              db.query(deposantSql, deposantValues, (err, result) => {
                if (err) {
                  console.error('Error during deposant insertion:', err);
                  return callback(err);
                }
                const deposantId = result.insertId;
                console.log('Deposant inserted with ID:', deposantId);

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
              const titulaireSql = 'INSERT INTO titulaire (nom, prenom, email, telephone, part_pi, client_correspondant, executant) VALUES (?, ?, ?, ?, ?, ?, ?)';
              const titulaireValues = [
                titulaire.nom_titulaire || null,
                titulaire.prenom_titulaire || null,
                titulaire.email_titulaire || null,
                titulaire.telephone_titulaire || null,
                titulaire.part_pi || null,
                titulaire.client_correspondant ? 1 : 0,
                titulaire.executant ? 1 : 0
              ];
              console.log('Inserting titulaire:', titulaireValues);

              db.query(titulaireSql, titulaireValues, (err, result) => {
                if (err) {
                  console.error('Error during titulaire insertion:', err);
                  return callback(err);
                }
                const titulaireId = result.insertId;
                console.log('Titulaire inserted with ID:', titulaireId);

                db.query('INSERT INTO brevet_titulaire (id_brevet, id_titulaire) VALUES (?, ?)', [brevetId, titulaireId], callback);
              });
            }, cb);
          } else {
            cb(null);
          }
        },

        // Insertion des numéros de pays
        (cb) => {
          if (brevetData.pays && brevetData.pays.length > 0) {
            async.each(brevetData.pays, (paysData, callback) => {
              const paysSql = 'SELECT nom_fr_fr FROM pays WHERE id_pays = ?';
              db.query(paysSql, [paysData.id_pays], (err, result) => {
                if (err) {
                  console.error('Error during pays selection:', err);
                  return callback(err);
                }
                const nom_fr_fr = result[0].nom_fr_fr;

                const insertNumeroPaysSql = `
                  INSERT INTO numero_pays (id_brevet, id_pays, numero_depot, numero_publication, nom_fr_fr)
                  VALUES (?, ?, ?, ?, ?)
                `;
                const insertNumeroPaysValues = [
                  brevetId,
                  paysData.id_pays || null,
                  paysData.numero_depot || null,
                  paysData.numero_publication || null,
                  nom_fr_fr || null
                ];
                console.log('Inserting pays:', insertNumeroPaysValues);

                db.query(insertNumeroPaysSql, insertNumeroPaysValues, callback);
              });
            }, cb);
          } else {
            cb(null);
          }
        },

        // Insertion des cabinets_procedure
        (cb) => {
          if (brevetData.cabinets_procedure && brevetData.cabinets_procedure.length > 0) {
            const cabinetProcedureValues = brevetData.cabinets_procedure.map(cabinet => [
              brevetId,
              cabinet.id_cabinet_procedure || null,
              cabinet.reference || null,
              cabinet.dernier_intervenant ? 1 : 0
            ]);

            console.log('Inserting cabinets_procedure:', cabinetProcedureValues);

            const insertCabinetProcedureSql = `
              INSERT INTO brevet_cabinet (id_brevet, id_cabinet, reference, dernier_intervenant)
              VALUES ?
            `;

            db.query(insertCabinetProcedureSql, [cabinetProcedureValues], (err, result) => {
              if (err) {
                console.error('Error during cabinet procedure insertion:', err);
                return cb(err);
              }
              console.log('Cabinets_procedure inserted:', result);
              cb(null);
            });
          } else {
            cb(null);
          }
        },

        // Insertion des cabinets_annuite
        (cb) => {
          if (brevetData.cabinets_annuite && brevetData.cabinets_annuite.length > 0) {
            const cabinetAnnuiteValues = brevetData.cabinets_annuite.map(cabinet => [
              brevetId,
              cabinet.id_cabinet_annuite || null,
              cabinet.reference || null,
              cabinet.dernier_intervenant ? 1 : 0
            ]);

            console.log('Inserting cabinets_annuite:', cabinetAnnuiteValues);

            const insertCabinetAnnuiteSql = `
              INSERT INTO brevet_cabinet (id_brevet, id_cabinet, reference, dernier_intervenant)
              VALUES ?
            `;

            db.query(insertCabinetAnnuiteSql, [cabinetAnnuiteValues], (err, result) => {
              if (err) {
                console.error('Error during cabinet annuite insertion:', err);
                return cb(err);
              }
              console.log('Cabinets_annuite inserted:', result);
              cb(null);
            });
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
      (cb) => db.query('DELETE FROM brevet_client WHERE id_brevet = ?', [id], cb), // Ajout pour supprimer les enregistrements liés dans brevet_client
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
        date_depot,
        numero_delivrance,
        date_delivrance,
        licence,
        id_statuts,
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
              console.log(`Inventeurs pour le brevet ${id}:`, results);
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
              console.log(`Déposants pour le brevet ${id}:`, results);
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
              console.log(`Titulaires pour le brevet ${id}:`, results);
              cb(null, results.map(r => ({
                id_titulaire: r.id_titulaire,
                nom: r.nom
              })));
            }
          );
        },

        // Récupération des numéros de pays associés
        numero_pays: (cb) => {
          db.query(
            'SELECT id_pays, numero_depot, numero_publication FROM numero_pays WHERE id_brevet = ?',
            [id],
            (err, results) => {
              if (err) {
                console.error('Error retrieving numero_pays:', err);
                return cb(err);
              }
              cb(null, results.map(r => ({
                id_pays: r.id_pays,
                numero_depot: r.numero_depot,
                numero_publication: r.numero_publication
              })));
            }
          );
        },

        // Récupération des cabinets associés
        cabinets: (cb) => {
          db.query(
            'SELECT id_cabinet, reference, dernier_intervenant FROM brevet_cabinet WHERE id_brevet = ?',
            [id],
            (err, results) => {
              if (err) {
                console.error('Error retrieving cabinets:', err);
                return cb(err);
              }
              cb(null, results.map(r => ({
                id_cabinet: r.id_cabinet,
                reference: r.reference,
                dernier_intervenant: !!r.dernier_intervenant
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
                console.error('Error retrieving pieces_jointes:', err);
                return cb(err);
              }
              cb(null, results.map(r => ({
                nom_fichier: r.nom_fichier,
                type_fichier: r.type_fichier,
                donnees: r.donnees, // Assurez-vous de gérer correctement les données binaires côté frontend
                date_ajout: r.date_ajout
              })));
            }
          );
        }
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
    })
  }

  static getByBrevetId(brevetId, callback) {
    console.log('Requête SQL exécutée pour id_brevet:', brevetId); // Debug
  
    const sql = 'SELECT * FROM brevet_pieces_jointes WHERE id_brevet = ?';
    db.query(sql, [brevetId], (err, results) => {
      if (err) {
        console.error('Erreur SQL:', err); // Debug
        return callback(err); // Gestion des erreurs
      }
      console.log('Résultats de la requête:', results); // Debug
      callback(null, results); // Retour des résultats en cas de succès
    });
  }
  
  // Récupération des brevets par ID de client
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


  // Mise à jour d'un brevet et de ses relations par ID ---- ancien update 
  // static update(id, brevetData, callback) {
  //   const brevetSql = `
  //     UPDATE brevet SET
  //       reference_famille = ?, titre = ?, date_depot = ?, numero_delivrance = ?,
  //       date_delivrance = ?, licence = ?, id_statuts = ?, 
  //       commentaire = ?, piece_jointe = ?
  //     WHERE id_brevet = ?
  //   `;
  //   const brevetValues = [
  //     brevetData.reference_famille, brevetData.titre, brevetData.date_depot, brevetData.numero_delivrance,
  //     brevetData.date_delivrance, brevetData.licence, brevetData.id_statuts, 
  //     brevetData.commentaire, brevetData.piece_jointe, id
  //   ];

  //   db.query(brevetSql, brevetValues, (err, result) => {
  //     if (err) {
  //       return callback(err);
  //     }

  //     async.parallel([

  //       // mise a jour des clients 
  //       (cb) => {
  //         db.query('DELETE FROM brevet_client WHERE id_brevet = ?', [id], (err) => {
  //           if (err) return cb(err);

  //           if (brevetData.clients && brevetData.clients.length > 0) {
  //             const brevetClientValues = brevetData.clients.map(client => [id, client.id_client]);
  //             const brevetClientSql = `INSERT INTO brevet_client (id_brevet, id_client) VALUES ?`;
  //             db.query(brevetClientSql, [brevetClientValues], cb);
  //           } else {
  //             cb(null);
  //           }
  //         });
  //       },

  //       // Mise à jour des inventeurs
  //       (cb) => {
  //         db.query('DELETE FROM brevet_inventeur WHERE id_brevet = ?', [id], (err) => {
  //           if (err) return cb(err);
  //           if (brevetData.inventeurs && brevetData.inventeurs.length > 0) {
  //             async.each(brevetData.inventeurs, (inventeur, callback) => {
  //               const inventeurSql = 'INSERT INTO inventeur (nom, prenom, email, telephone) VALUES (?, ?, ?, ?)';
  //               const inventeurValues = [inventeur.nom, inventeur.prenom, inventeur.email, inventeur.telephone];
  //               db.query(inventeurSql, inventeurValues, (err, result) => {
  //                 if (err) return callback(err);
  //                 const inventeurId = result.insertId;
  //                 db.query('INSERT INTO brevet_inventeur (id_brevet, id_inventeur) VALUES (?, ?)', [id, inventeurId], callback);
  //               });
  //             }, cb);
  //           } else {
  //             cb(null);
  //           }
  //         });
  //       },
  //       // Mise à jour des déposants
  //       (cb) => {
  //         db.query('DELETE FROM brevet_deposant WHERE id_brevet = ?', [id], (err) => {
  //           if (err) return cb(err);
  //           if (brevetData.deposants && brevetData.deposants.length > 0) {
  //             async.each(brevetData.deposants, (deposant, callback) => {
  //               const deposantSql = 'INSERT INTO deposant (nom, prenom, email, telephone) VALUES (?, ?, ?, ?)';
  //               const deposantValues = [deposant.nom, deposant.prenom, deposant.email, deposant.telephone];
  //               db.query(deposantSql, deposantValues, (err, result) => {
  //                 if (err) return callback(err);
  //                 const deposantId = result.insertId;
  //                 db.query('INSERT INTO brevet_deposant (id_brevet, id_deposant) VALUES (?, ?)', [id, deposantId], callback);
  //               });
  //             }, cb);
  //           } else {
  //             cb(null);
  //           }
  //         });
  //       },
  //       // Mise à jour des titulaires
  //       (cb) => {
  //         db.query('DELETE FROM brevet_titulaire WHERE id_brevet = ?', [id], (err) => {
  //           if (err) return cb(err);
  //           if (brevetData.titulaires && brevetData.titulaires.length > 0) {
  //             async.each(brevetData.titulaires, (titulaire, callback) => {
  //               const titulaireSql = 'INSERT INTO titulaire (nom, prenom, email, telephone, part_pi, client_correspondant, executant) VALUES (?, ?, ?, ?, ?, ?, ?)';
  //               const titulaireValues = [titulaire.nom, titulaire.prenom, titulaire.email, titulaire.telephone, titulaire.part_pi, titulaire.client_correspondant, titulaire.executant];
  //               db.query(titulaireSql, titulaireValues, (err, result) => {
  //                 if (err) return callback(err);
  //                 const titulaireId = result.insertId;
  //                 db.query('INSERT INTO brevet_titulaire (id_brevet, id_titulaire) VALUES (?, ?)', [id, titulaireId], callback);
  //               });
  //             }, cb);
  //           } else {
  //             cb(null);
  //           }
  //         });
  //       },
  //       // Mise à jour des numéros de pays
  //       (cb) => {
  //         db.query('DELETE FROM numero_pays WHERE id_brevet = ?', [id], (err) => {
  //           if (err) return cb(err);
  //           if (brevetData.numero_pays && brevetData.numero_pays.length > 0) {
  //             const numeroPaysValues = brevetData.numero_pays.map(np => [id, np.id_pays, np.numero_depot, np.numero_publication]);
  //             db.query('INSERT INTO numero_pays (id_brevet, id_pays, numero_depot, numero_publication) VALUES ?', [numeroPaysValues], cb);
  //           } else {
  //             cb(null);
  //           }
  //         });
  //       },
  //       // Mise à jour des cabinets
  //       (cb) => {
  //         db.query('DELETE FROM brevet_cabinet WHERE id_brevet = ?', [id], (err) => {
  //           if (err) return cb(err);
  //           if (brevetData.cabinets && brevetData.cabinets.length > 0) {
  //             const cabinetValues = brevetData.cabinets.map(cabinet => [id, cabinet.id_cabinet, cabinet.reference, cabinet.dernier_intervenant]);
  //             db.query('INSERT INTO brevet_cabinet (id_brevet, id_cabinet, reference, dernier_intervenant) VALUES ?', [cabinetValues], cb);
  //           } else {
  //             cb(null);
  //           }
  //         });
  //       }
  //     ], callback);
  //   });
  // }
  static update(id, brevetData, callback) {
    const brevetSql = `
      UPDATE brevet SET
        reference_famille = ?, titre = ?, date_depot = ?, numero_delivrance = ?,
        date_delivrance = ?, licence = ?, id_statuts = ?, 
        commentaire = ?, piece_jointe = ?
      WHERE id_brevet = ?
    `;

    // Convertir la licence (Oui/Non) en valeur binaire (1/0)
    const licenceValue = brevetData.licence === 'Oui' ? 1 : 0;
    const pieceJointeValue = brevetData.piece_jointe ? brevetData.piece_jointe : null;

    // Si `piece_jointe` existe, on l'insère, sinon on met `null`
    const brevetValues = [
      brevetData.reference_famille, brevetData.titre, brevetData.date_depot, brevetData.numero_delivrance,
      brevetData.date_delivrance, licenceValue, brevetData.id_statuts || null, // gestion des champs vides
      brevetData.commentaire || '', pieceJointeValue, id
    ];

    db.query(brevetSql, brevetValues, (err, result) => {
      if (err) {
        return callback(err);
      }

      // Mise à jour des clients
      async.parallel([

        // Clients
        (cb) => {
          db.query('SELECT id_client FROM brevet_client WHERE id_brevet = ?', [id], (err, currentClients) => {
            if (err) return cb(err);

            const currentClientIds = currentClients.map(client => client.id_client);
            const newClientIds = brevetData.clients ? brevetData.clients.map(client => client.id_client) : [];

            // Supprimer les anciens clients
            const clientsToDelete = currentClientIds.filter(id_client => !newClientIds.includes(id_client));
            if (clientsToDelete.length > 0) {
              db.query('DELETE FROM brevet_client WHERE id_brevet = ? AND id_client IN (?)', [id, clientsToDelete], (err) => {
                if (err) return cb(err);
              });
            }

            // Ajouter les nouveaux clients
            const clientsToAdd = newClientIds.filter(id_client => !currentClientIds.includes(id_client));
            if (clientsToAdd.length > 0) {
              const brevetClientValues = clientsToAdd.map(clientId => [id, clientId]);
              const brevetClientSql = `INSERT INTO brevet_client (id_brevet, id_client) VALUES ?`;
              db.query(brevetClientSql, [brevetClientValues], cb);
            } else {
              cb(null);
            }
          });
        },

        // Inventeurs
        (cb) => {
          db.query('SELECT id_inventeur FROM brevet_inventeur WHERE id_brevet = ?', [id], (err, currentInventeurs) => {
            if (err) return cb(err);

            const currentInventeurIds = currentInventeurs.map(inv => inv.id_inventeur);
            const newInventeurIds = brevetData.inventeurs ? brevetData.inventeurs.map(inventeur => inventeur.id_inventeur) : [];

            // Supprimer les anciens inventeurs
            const inventeursToDelete = currentInventeurIds.filter(id_inventeur => !newInventeurIds.includes(id_inventeur));
            if (inventeursToDelete.length > 0) {
              db.query('DELETE FROM brevet_inventeur WHERE id_brevet = ? AND id_inventeur IN (?)', [id, inventeursToDelete], (err) => {
                if (err) return cb(err);
              });
            }

            // Ajouter les nouveaux inventeurs
            async.each(brevetData.inventeurs, (inventeur, callback) => {
              if (!currentInventeurIds.includes(inventeur.id_inventeur)) {
                const inventeurSql = 'INSERT INTO inventeur (nom, prenom, email, telephone) VALUES (?, ?, ?, ?)';
                const inventeurValues = [inventeur.nom, inventeur.prenom, inventeur.email, inventeur.telephone];
                db.query(inventeurSql, inventeurValues, (err, result) => {
                  if (err) return callback(err);
                  const inventeurId = result.insertId;
                  db.query('INSERT INTO brevet_inventeur (id_brevet, id_inventeur) VALUES (?, ?)', [id, inventeurId], callback);
                });
              } else {
                callback(null);
              }
            }, cb);
          });
        },

        // Déposants
        (cb) => {
          db.query('SELECT id_deposant FROM brevet_deposant WHERE id_brevet = ?', [id], (err, currentDeposants) => {
            if (err) return cb(err);

            const currentDeposantIds = currentDeposants.map(dep => dep.id_deposant);
            const newDeposantIds = brevetData.deposants ? brevetData.deposants.map(deposant => deposant.id_deposant) : [];

            // Supprimer les anciens déposants
            const deposantsToDelete = currentDeposantIds.filter(id_deposant => !newDeposantIds.includes(id_deposant));
            if (deposantsToDelete.length > 0) {
              db.query('DELETE FROM brevet_deposant WHERE id_brevet = ? AND id_deposant IN (?)', [id, deposantsToDelete], (err) => {
                if (err) return cb(err);
              });
            }

            // Ajouter les nouveaux déposants
            async.each(brevetData.deposants, (deposant, callback) => {
              if (!currentDeposantIds.includes(deposant.id_deposant)) {
                const deposantSql = 'INSERT INTO deposant (nom, prenom, email, telephone) VALUES (?, ?, ?, ?)';
                const deposantValues = [deposant.nom, deposant.prenom, deposant.email, deposant.telephone];
                db.query(deposantSql, deposantValues, (err, result) => {
                  if (err) return callback(err);
                  const deposantId = result.insertId;
                  db.query('INSERT INTO brevet_deposant (id_brevet, id_deposant) VALUES (?, ?)', [id, deposantId], callback);
                });
              } else {
                callback(null);
              }
            }, cb);
          });
        },

        // Titulaires
        (cb) => {
          db.query('SELECT id_titulaire FROM brevet_titulaire WHERE id_brevet = ?', [id], (err, currentTitulaires) => {
            if (err) return cb(err);

            const currentTitulaireIds = currentTitulaires.map(tit => tit.id_titulaire);
            const newTitulaireIds = brevetData.titulaires ? brevetData.titulaires.map(titulaire => titulaire.id_titulaire) : [];

            // Supprimer les anciens titulaires
            const titulairesToDelete = currentTitulaireIds.filter(id_titulaire => !newTitulaireIds.includes(id_titulaire));
            if (titulairesToDelete.length > 0) {
              db.query('DELETE FROM brevet_titulaire WHERE id_brevet = ? AND id_titulaire IN (?)', [id, titulairesToDelete], (err) => {
                if (err) return cb(err);
              });
            }

            // Ajouter les nouveaux titulaires
            async.each(brevetData.titulaires, (titulaire, callback) => {
              if (!currentTitulaireIds.includes(titulaire.id_titulaire)) {
                const titulaireSql = 'INSERT INTO titulaire (nom, prenom, email, telephone, part_pi, client_correspondant, executant) VALUES (?, ?, ?, ?, ?, ?, ?)';
                const titulaireValues = [titulaire.nom, titulaire.prenom, titulaire.email, titulaire.telephone, titulaire.part_pi, titulaire.client_correspondant, titulaire.executant];
                db.query(titulaireSql, titulaireValues, (err, result) => {
                  if (err) return callback(err);
                  const titulaireId = result.insertId;
                  db.query('INSERT INTO brevet_titulaire (id_brevet, id_titulaire) VALUES (?, ?)', [id, titulaireId], callback);
                });
              } else {
                callback(null);
              }
            }, cb);
          });
        },

        // Pays et Numéros
        (cb) => {
          db.query('SELECT id_pays FROM numero_pays WHERE id_brevet = ?', [id], (err, currentPays) => {
            if (err) return cb(err);

            const currentPaysIds = currentPays.map(p => p.id_pays);
            const newPaysIds = brevetData.numero_pays ? brevetData.numero_pays.map(np => np.id_pays) : [];

            // Supprimer les anciens pays
            const paysToDelete = currentPaysIds.filter(id_pays => !newPaysIds.includes(id_pays));
            if (paysToDelete.length > 0) {
              db.query('DELETE FROM numero_pays WHERE id_brevet = ? AND id_pays IN (?)', [id, paysToDelete], (err) => {
                if (err) return cb(err);
              });
            }

            // Ajouter les nouveaux pays
            const paysToAdd = newPaysIds.filter(id_pays => !currentPaysIds.includes(id_pays));
            if (paysToAdd.length > 0) {
              const numeroPaysValues = brevetData.numero_pays.map(np => [id, np.id_pays, np.numero_depot, np.numero_publication]);
              db.query('INSERT INTO numero_pays (id_brevet, id_pays, numero_depot, numero_publication) VALUES ?', [numeroPaysValues], cb);
            } else {
              cb(null);
            }
          });
        }
      ], callback);
    });
  }



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

}

module.exports = Brevet;
