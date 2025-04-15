const { Brevet, Client, Titulaire, Deposant, Inventeur, Cabinet, NumeroPays, Pays, Statuts, sequelize } = require('../models');
const Op = sequelize.Sequelize.Op;

const brevetController = {
  createBrevet: async (req, res) => {
    const t = await sequelize.transaction(); // Créer une transaction
    
    try {
      // Logs de débogage détaillés
      console.log("=== DÉBUT DE LA REQUÊTE ===");
      console.log("Content-Type:", req.headers['content-type']);
      console.log("Body keys:", Object.keys(req.body));
      console.log("Body (brut):", req.body);
      
      // 1. Extraction des données de base du brevet
      const brevetData = {
        reference_famille: req.body.reference_famille,
        titre: req.body.titre,
        commentaire: req.body.commentaire || ''
      };
      
      // Vérification des données requises (avec plus de détails)
      if (!brevetData.reference_famille || !brevetData.titre) {
        console.log("ERREUR: Données manquantes:", {
          reference_famille: brevetData.reference_famille,
          titre: brevetData.titre
        });
        return res.status(400).json({
          error: 'Données requises manquantes (référence famille et titre)'
        });
      }
      
      // 3. Création du brevet avec logs détaillés
      console.log("Données du brevet à créer:", JSON.stringify(brevetData, null, 2));
      const brevet = await Brevet.create(brevetData, { transaction: t });
      const brevetId = brevet.id;
      console.log("Brevet créé avec ID:", brevetId);
      
      // 4. Fonction de parsing améliorée pour les données JSON
      const parseJSONSafely = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        try {
          // Si c'est déjà un objet, on le retourne directement
          if (typeof data === 'object' && data !== null) return data;
          return JSON.parse(data);
        } catch (e) {
          console.error('Erreur de parsing JSON:', e, 'Données reçues:', data);
          // Si le parsing échoue mais que data est une chaîne avec [, on tente de nettoyer
          if (typeof data === 'string' && data.includes('[')) {
            try {
              // Tentative de nettoyage des caractères spéciaux
              const cleanedData = data.replace(/\\/g, '').replace(/"\[/g, '[').replace(/\]"/g, ']');
              return JSON.parse(cleanedData);
            } catch (cleanError) {
              console.error('Échec du nettoyage JSON:', cleanError);
            }
          }
          return [];
        }
      };
      
      // 4.1 Clients avec meilleure gestion des erreurs
      try {
        const clients = parseJSONSafely(req.body.clients);
        console.log("Clients à associer (après parsing):", clients);
        
        if (clients && clients.length > 0) {
          for (const client of clients) {
            if (client && client.id_client) {
              await sequelize.models.BrevetClients.create({
                BrevetId: brevetId,
                ClientId: parseInt(client.id_client, 10) || client.id_client
              }, { transaction: t });
              console.log(`Client associé: ${client.id_client}`);
            } else {
              console.warn("Client invalide ignoré:", client);
            }
          }
        }
      } catch (clientError) {
        console.error("Erreur lors du traitement des clients:", clientError);
        // On continue même si les clients échouent
      }
      
      // 4.2 Informations de dépôt
      try {
        const informationsDepot = parseJSONSafely(req.body.informations_depot);
        console.log("Informations de dépôt (après parsing):", informationsDepot);
        
        if (informationsDepot && informationsDepot.length > 0) {
          for (const info of informationsDepot) {
            if (info && info.id_pays) {
              await NumeroPays.create({
                id_brevet: brevetId,
                id_pays: parseInt(info.id_pays, 10) || info.id_pays,
                numero_depot: info.numero_depot || null,
                numero_publication: info.numero_publication || null,
                id_statuts: info.id_statuts ? (parseInt(info.id_statuts, 10) || info.id_statuts) : null,
                date_depot: info.date_depot || null,
                numero_delivrance: info.numero_delivrance || null,
                date_publication: info.date_publication || null,
                date_delivrance: info.date_delivrance || null,
                licence: info.licence === '1' || info.licence === 1 || info.licence === true
              }, { transaction: t });
              console.log(`Information de dépôt ajoutée pour pays: ${info.id_pays}`);
            } else {
              console.warn("Information de dépôt invalide ignorée:", info);
            }
          }
        }
      } catch (depotError) {
        console.error("Erreur lors du traitement des informations de dépôt:", depotError);
      }
      
      // 4.3 Inventeurs avec gestion unique de la colonne PaysId
      try {
        const inventeurs = parseJSONSafely(req.body.inventeurs);
        console.log("Inventeurs à créer (après parsing):", inventeurs);
        
        if (inventeurs && inventeurs.length > 0) {
          for (const inventeur of inventeurs) {
            if (inventeur && inventeur.nom_inventeur) {
              const nouvelInventeur = await Inventeur.create({
                nom_inventeur: inventeur.nom_inventeur,
                prenom_inventeur: inventeur.prenom_inventeur || null,
                email_inventeur: inventeur.email_inventeur || null,
                telephone_inventeur: inventeur.telephone_inventeur || null
              }, { transaction: t });

              await sequelize.models.BrevetInventeurs.create({
                BrevetId: brevetId,
                InventeurId: nouvelInventeur.id
              }, { transaction: t });
              
              // Associer les pays à l'inventeur - Correction de la relation
              const pays = parseJSONSafely(inventeur.pays);
              if (pays && pays.length > 0) {
                for (const pays_item of pays) {
                  if (pays_item && pays_item.id_pays) {
                    const paysId = isNaN(parseInt(pays_item.id_pays, 10)) ? pays_item.id_pays : parseInt(pays_item.id_pays, 10);
                    await sequelize.models.InventeurPays.create({
                      InventeurId: nouvelInventeur.id,
                      PaysId: paysId, // Utiliser PaysId et non PayId
                      licence: pays_item.licence === '1' || pays_item.licence === 1 || pays_item.licence === true
                    }, { transaction: t });
                  }
                }
              }
            }
          }
        }
      } catch (inventeurError) {
        console.error("Erreur lors du traitement des inventeurs:", inventeurError);
      }
      
      // 4.4 Titulaires avec gestion unique de la colonne PaysId
      try {
        const titulaires = parseJSONSafely(req.body.titulaires);
        console.log("Titulaires à créer (après parsing):", titulaires);
        
        if (titulaires && titulaires.length > 0) {
          for (const titulaire of titulaires) {
            if (titulaire && titulaire.nom_titulaire) {
              const nouveauTitulaire = await Titulaire.create({
                nom_titulaire: titulaire.nom_titulaire,
                prenom_titulaire: titulaire.prenom_titulaire || null,
                email_titulaire: titulaire.email_titulaire || null,
                telephone_titulaire: titulaire.telephone_titulaire || null,
                part_pi: titulaire.part_pi || null,
                executant: titulaire.executant === '1' || titulaire.executant === 1 || titulaire.executant === true,
                client_correspondant: titulaire.client_correspondant === '1' || titulaire.client_correspondant === 1 || titulaire.client_correspondant === true
              }, { transaction: t });

              await sequelize.models.BrevetTitulaires.create({
                BrevetId: brevetId,
                TitulaireId: nouveauTitulaire.id
              }, { transaction: t });
              
              // Associer les pays au titulaire
              const pays = parseJSONSafely(titulaire.pays);
              if (pays && pays.length > 0) {
                for (const pays_item of pays) {
                  if (pays_item && pays_item.id_pays) {
                    const paysId = isNaN(parseInt(pays_item.id_pays, 10)) ? pays_item.id_pays : parseInt(pays_item.id_pays, 10);
                    await sequelize.models.TitulairePays.create({
                      TitulaireId: nouveauTitulaire.id,
                      PaysId: paysId, // Utiliser PaysId et non PayId
                      licence: pays_item.licence === '1' || pays_item.licence === 1 || pays_item.licence === true
                    }, { transaction: t });
                  }
                }
              }
            }
          }
        }
      } catch (titulaireError) {
        console.error("Erreur lors du traitement des titulaires:", titulaireError);
      }
      
      // 4.5 Déposants avec gestion unique de la colonne PaysId
      try {
        const deposants = parseJSONSafely(req.body.deposants);
        console.log("Déposants à créer (après parsing):", deposants);
        
        if (deposants && deposants.length > 0) {
          for (const deposant of deposants) {
            if (deposant && deposant.nom_deposant) {
              const nouveauDeposant = await Deposant.create({
                nom_deposant: deposant.nom_deposant,
                prenom_deposant: deposant.prenom_deposant || null,
                email_deposant: deposant.email_deposant || null,
                telephone_deposant: deposant.telephone_deposant || null
              }, { transaction: t });

              await sequelize.models.BrevetDeposants.create({
                BrevetId: brevetId,
                DeposantId: nouveauDeposant.id
              }, { transaction: t });
              
              // Associer les pays au déposant
              const pays = parseJSONSafely(deposant.pays);
              if (pays && pays.length > 0) {
                for (const pays_item of pays) {
                  if (pays_item && pays_item.id_pays) {
                    const paysId = isNaN(parseInt(pays_item.id_pays, 10)) ? pays_item.id_pays : parseInt(pays_item.id_pays, 10);
                    await sequelize.models.DeposantPays.create({
                      DeposantId: nouveauDeposant.id,
                      PaysId: paysId, // Utiliser PaysId et non PayId
                      licence: pays_item.licence === '1' || pays_item.licence === 1 || pays_item.licence === true
                    }, { transaction: t });
                  }
                }
              }
            }
          }
        }
      } catch (deposantError) {
        console.error("Erreur lors du traitement des déposants:", deposantError);
      }
      
      // 4.6 Cabinets de procédure avec meilleure gestion des erreurs
      try {
        const cabinetsProcedure = parseJSONSafely(req.body.cabinets_procedure);
        console.log("Cabinets de procédure à associer (après parsing):", cabinetsProcedure);
        
        if (cabinetsProcedure && cabinetsProcedure.length > 0) {
          for (const cabinet of cabinetsProcedure) {
            if (cabinet && cabinet.id_cabinet) {
              await sequelize.models.BrevetCabinets.create({
                BrevetId: brevetId,
                CabinetId: parseInt(cabinet.id_cabinet, 10) || cabinet.id_cabinet,
                reference: cabinet.reference || null,
                dernier_intervenant: cabinet.dernier_intervenant === '1' || cabinet.dernier_intervenant === 1 || cabinet.dernier_intervenant === true,
                contact_id: cabinet.id_contact ? (parseInt(cabinet.id_contact, 10) || cabinet.id_contact) : null,
                type: 'procedure'
              }, { transaction: t });
              
              // Associer les pays au cabinet
              const pays = parseJSONSafely(cabinet.pays);
              if (pays && pays.length > 0) {
                for (const pays_item of pays) {
                  if (pays_item && pays_item.id_pays) {
                    const paysId = isNaN(parseInt(pays_item.id_pays, 10)) ? pays_item.id_pays : parseInt(pays_item.id_pays, 10);
                    await sequelize.models.CabinetPays.create({
                      CabinetId: parseInt(cabinet.id_cabinet, 10) || cabinet.id_cabinet,
                      PaysId: paysId
                    }, { transaction: t });
                  }
                }
              }
            }
          }
        }
      } catch (cabinetProcedureError) {
        console.error("Erreur lors du traitement des cabinets de procédure:", cabinetProcedureError);
      }
      
      // 4.7 Cabinets d'annuité avec meilleure gestion des erreurs
      try {
        const cabinetsAnnuite = parseJSONSafely(req.body.cabinets_annuite);
        console.log("Cabinets d'annuité à associer (après parsing):", cabinetsAnnuite);
        
        if (cabinetsAnnuite && cabinetsAnnuite.length > 0) {
          for (const cabinet of cabinetsAnnuite) {
            if (cabinet && cabinet.id_cabinet) {
              await sequelize.models.BrevetCabinets.create({
                BrevetId: brevetId,
                CabinetId: parseInt(cabinet.id_cabinet, 10) || cabinet.id_cabinet,
                reference: cabinet.reference || null,
                dernier_intervenant: cabinet.dernier_intervenant === '1' || cabinet.dernier_intervenant === 1 || cabinet.dernier_intervenant === true,
                contact_id: cabinet.id_contact ? (parseInt(cabinet.id_contact, 10) || cabinet.id_contact) : null,
                type: 'annuite'
              }, { transaction: t });
              
              // Associer les pays au cabinet
              const pays = parseJSONSafely(cabinet.pays);
              if (pays && pays.length > 0) {
                for (const pays_item of pays) {
                  if (pays_item && pays_item.id_pays) {
                    const paysId = isNaN(parseInt(pays_item.id_pays, 10)) ? pays_item.id_pays : parseInt(pays_item.id_pays, 10);
                    await sequelize.models.CabinetPays.create({
                      CabinetId: parseInt(cabinet.id_cabinet, 10) || cabinet.id_cabinet,
                      PaysId: paysId
                    }, { transaction: t });
                  }
                }
              }
            }
          }
        }
      } catch (cabinetAnnuiteError) {
        console.error("Erreur lors du traitement des cabinets d'annuité:", cabinetAnnuiteError);
      }
      
      // Valider la transaction et envoyer la réponse
      await t.commit();
      console.log("=== TRANSACTION VALIDÉE AVEC SUCCÈS ===");
      
      res.status(201).json({
        message: 'Brevet créé avec succès',
        data: brevet
      });
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await t.rollback();
      console.error("=== ERREUR LORS DE LA CRÉATION DU BREVET ===");
      console.error(error.name, error.message);
      console.error(error.stack);
      
      res.status(500).json({
        error: 'Erreur lors de la création du brevet',
        details: error.message,
        name: error.name
      });
    }
  },

  getAllBrevets: async (req, res) => {
    try {
      const results = await Brevet.findAll();
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération brevets:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des brevets' });
    }
  },

  getBrevetById: async (req, res) => {
    try {
      const result = await Brevet.findByPk(req.params.id);
      if (result) {
        res.status(200).json({ data: result });
      } else {
        res.status(404).json({ error: 'Brevet non trouvé' });
      }
    } catch (error) {
      console.error('Erreur récupération brevet:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du brevet' });
    }
  },

  // Méthode corrigée pour récupérer les brevets d'un client via la table de jointure
  getByClientId: async (req, res) => {
    try {
      const clientId = req.params.id; // On suppose que la route est /brevets/client/:id
      console.log(`Recherche des brevets pour le client ID: ${clientId}`);
      
      const brevets = await Brevet.findAll({
        include: [{
          model: Client,
          where: { id: clientId }
        }]
      });
      
      console.log(`Nombre de brevets trouvés pour le client ${clientId}: ${brevets.length}`);
      res.status(200).json({ data: brevets || [] }); // Garantit qu'on renvoie toujours un tableau
    } catch (error) {
      console.error('Erreur récupération brevets par client:', error);
      res.status(500).json({ error: error.message });
    }
  },

  updateBrevet: async (req, res) => {
    try {
      // Vérifier si req.body contient des données
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Aucune donnée fournie pour la mise à jour' });
      }
      
      console.log(`Mise à jour du brevet ID: ${req.params.id} avec les données:`, req.body);
      
      const result = await Brevet.update(req.body, { where: { id: req.params.id } });
      if (result[0] === 0) {
        res.status(404).json({ error: 'Brevet non trouvé' });
      } else {
        res.status(200).json({ message: 'Brevet mis à jour avec succès' });
      }
    } catch (error) {
      console.error('Erreur mise à jour brevet:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du brevet' });
    }
  },

  deleteBrevet: async (req, res) => {
    try {
      const result = await Brevet.destroy({ where: { id: req.params.id } });
      if (result === 0) {
        res.status(404).json({ error: 'Brevet non trouvé' });
      } else {
        res.status(200).json({ message: 'Brevet supprimé avec succès' });
      }
    } catch (error) {
      console.error('Erreur suppression brevet:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du brevet' });
    }
  },

  getAllBrevetsWithRelations: async (req, res) => {
    try {
      const titre = req.query.titre;
      const condition = titre ? { titre: { [Op.like]: `%${titre}%` } } : null;

      const results = await Brevet.findAll({ 
        where: condition,
        include: [{
          model: Client
        }, {
          model: Titulaire
        }, {
          model: Deposant
        }, {
          model: Inventeur
        }, {
          model: Cabinet
        }, {
          model: NumeroPays
        }]
      });
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération brevets avec relations:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des brevets' });
    }
  },

  getBrevetByIdWithRelations: async (req, res) => {
    try {
      const result = await Brevet.findByPk(req.params.id, {
        include: [{
          model: Client
        }, {
          model: Titulaire
        }, {
          model: Deposant
        }, {
          model: Inventeur
        }, {
          model: Cabinet
        }, {
          model: NumeroPays,
          include: [{
            model: Pays
          }, {
            model: Statuts
          }]
        }]
      });
      
      if (result) {
        res.status(200).json({ data: result });
      } else {
        res.status(404).json({ error: 'Brevet non trouvé' });
      }
    } catch (error) {
      console.error('Erreur récupération brevet avec relations:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du brevet' });
    }
  },

  addTitulaire: async (req, res) => {
    try {
      const brevetId = req.params.brevetId;
      const titulaireId = req.body.titulaireId;
      
      await sequelize.models.BrevetTitulaires.create({
        BrevetId: brevetId,
        TitulaireId: titulaireId
      });
      
      res.status(200).json({ message: "Titulaire ajouté au brevet avec succès!" });
    } catch (error) {
      console.error('Erreur ajout titulaire:', error);
      res.status(500).json({ error: 'Une erreur est survenue lors de l\'ajout du titulaire au brevet' });
    }
  },

  addInventeur: async (req, res) => {
    try {
      const brevetId = req.params.brevetId;
      const inventeurId = req.body.inventeurId;
      
      await sequelize.models.BrevetInventeurs.create({
        BrevetId: brevetId,
        InventeurId: inventeurId
      });
      
      res.status(200).json({ message: "Inventeur ajouté au brevet avec succès!" });
    } catch (error) {
      console.error('Erreur ajout inventeur:', error);
      res.status(500).json({ error: 'Une erreur est survenue lors de l\'ajout de l\'inventeur au brevet' });
    }
  },

  addDeposant: async (req, res) => {
    try {
      const brevetId = req.params.brevetId;
      const deposantId = req.body.deposantId;
      
      await sequelize.models.BrevetDeposants.create({
        BrevetId: brevetId,
        DeposantId: deposantId
      });
      
      res.status(200).json({ message: "Déposant ajouté au brevet avec succès!" });
    } catch (error) {
      console.error('Erreur ajout déposant:', error);
      res.status(500).json({ error: 'Une erreur est survenue lors de l\'ajout du déposant au brevet' });
    }
  },

  getClientsByBrevetId: async (req, res) => {
    try {
      const brevetId = req.params.id;
      console.log(`Recherche des clients pour le brevet ID: ${brevetId}`);
      
      const brevet = await Brevet.findByPk(brevetId, {
        include: [{
          model: Client
        }]
      });
      
      if (!brevet) {
        return res.status(404).json({ error: 'Brevet non trouvé' });
      }
      
      console.log(`Nombre de clients trouvés pour le brevet ${brevetId}: ${brevet.Clients?.length || 0}`);
      res.status(200).json(brevet.Clients || []);
    } catch (error) {
      console.error('Erreur récupération clients par brevet:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Nouvelle méthode pour récupérer les statuts d'un brevet
  getStatutsByBrevetId: async (req, res) => {
    try {
      const brevetId = req.params.id;
      console.log(`Recherche des statuts pour le brevet ID: ${brevetId}`);
      
      const numeros = await NumeroPays.findAll({
        where: { id_brevet: brevetId },
        include: [{
          model: Statuts
        }]
      });
      
      // On extrait juste les statuts des numéros
      const statuts = numeros
        .filter(numero => numero.Statut)
        .map(numero => numero.Statut);
      
      console.log(`Nombre de statuts trouvés pour le brevet ${brevetId}: ${statuts.length}`);
      res.status(200).json(statuts);
    } catch (error) {
      console.error('Erreur récupération statuts par brevet:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Nouvelle méthode pour récupérer les inventeurs d'un brevet
  getInventeursByBrevetId: async (req, res) => {
    try {
      const brevetId = req.params.id;
      console.log(`Recherche des inventeurs pour le brevet ID: ${brevetId}`);
      
      const brevet = await Brevet.findByPk(brevetId, {
        include: [{
          model: Inventeur,
          include: [{ model: Pays }] // Inclure les pays associés aux inventeurs
        }]
      });
      
      if (!brevet) {
        return res.status(404).json({ error: 'Brevet non trouvé' });
      }
      
      console.log(`Nombre d'inventeurs trouvés pour le brevet ${brevetId}: ${brevet.Inventeurs?.length || 0}`);
      res.status(200).json(brevet.Inventeurs || []);
    } catch (error) {
      console.error('Erreur récupération inventeurs par brevet:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Nouvelle méthode pour récupérer les titulaires d'un brevet
  getTitulairesByBrevetId: async (req, res) => {
    try {
      const brevetId = req.params.id;
      console.log(`Recherche des titulaires pour le brevet ID: ${brevetId}`);
      
      const brevet = await Brevet.findByPk(brevetId, {
        include: [{
          model: Titulaire,
          include: [{ model: Pays }] // Inclure les pays associés aux titulaires
        }]
      });
      
      if (!brevet) {
        return res.status(404).json({ error: 'Brevet non trouvé' });
      }
      
      console.log(`Nombre de titulaires trouvés pour le brevet ${brevetId}: ${brevet.Titulaires?.length || 0}`);
      res.status(200).json(brevet.Titulaires || []);
    } catch (error) {
      console.error('Erreur récupération titulaires par brevet:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Nouvelle méthode pour récupérer les déposants d'un brevet
  getDeposantsByBrevetId: async (req, res) => {
    try {
      const brevetId = req.params.id;
      console.log(`Recherche des déposants pour le brevet ID: ${brevetId}`);
      
      const brevet = await Brevet.findByPk(brevetId, {
        include: [{
          model: Deposant,
          include: [{ model: Pays }] // Inclure les pays associés aux déposants
        }]
      });
      
      if (!brevet) {
        return res.status(404).json({ error: 'Brevet non trouvé' });
      }
      
      console.log(`Nombre de déposants trouvés pour le brevet ${brevetId}: ${brevet.Deposants?.length || 0}`);
      res.status(200).json(brevet.Deposants || []);
    } catch (error) {
      console.error('Erreur récupération déposants par brevet:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Méthode améliorée pour récupérer tous les cabinets d'un brevet
  getAllCabinetsByBrevetId: async (req, res) => {
    try {
      const brevetId = req.params.id;
      console.log(`Recherche de tous les cabinets pour le brevet ID: ${brevetId}`);
      
      // Récupérer d'abord les relations BrevetCabinets
      const brevetCabinets = await sequelize.models.BrevetCabinets.findAll({
        where: { BrevetId: brevetId },
        raw: true
      });
      
      if (!brevetCabinets || brevetCabinets.length === 0) {
        console.log(`Aucune relation cabinet trouvée pour le brevet ${brevetId}`);
        return res.status(200).json({ 
          data: [], 
          procedure: [], 
          annuite: [] 
        });
      }
      
      // Log détaillé des relations trouvées
      console.log(`Relations cabinet trouvées: ${brevetCabinets.length}`);
      console.log("Types trouvés:", [...new Set(brevetCabinets.map(rel => rel.type))]);
      
      // Récupérer les cabinets complets
      const cabinetIds = brevetCabinets.map(rel => rel.CabinetId);
      const cabinets = await Cabinet.findAll({
        where: { id: { [Op.in]: cabinetIds } }
      });
      
      // Récupérer séparément les relations CabinetPays pour éviter l'erreur d'eager loading
      const cabinetPaysRelations = await sequelize.query(
        `SELECT cp.*, p.* FROM CabinetPays cp
         JOIN pays p ON cp.PaysId = p.id
         WHERE cp.CabinetId IN (${cabinetIds.join(',')})`,
        { 
          type: sequelize.QueryTypes.SELECT,
          nest: true
        }
      );
      
      console.log(`Cabinets récupérés: ${cabinets.length}, relations pays: ${cabinetPaysRelations.length}`);
      
      // Enrichir les cabinets avec les données de la relation et les pays
      const enrichedCabinets = cabinets.map(cabinet => {
        const cabinetObj = cabinet.toJSON();
        
        // Trouver la relation correspondant à ce cabinet
        const relation = brevetCabinets.find(rel => rel.CabinetId === cabinet.id);
        
        // Si une relation a été trouvée, l'ajouter au cabinet
        if (relation) {
          cabinetObj.BrevetCabinets = relation;
        }
        
        // Ajouter les pays associés à ce cabinet
        const cabinetPays = cabinetPaysRelations.filter(cp => cp.CabinetId === cabinet.id);
        if (cabinetPays && cabinetPays.length > 0) {
          cabinetObj.Pays = cabinetPays.map(cp => cp.p || cp);
        } else {
          cabinetObj.Pays = [];
        }
        
        return cabinetObj;
      });
      
      // Séparer les cabinets par type en se basant sur le type dans la relation BrevetCabinets
      const procedureCabinets = enrichedCabinets.filter(cab => {
        return cab.BrevetCabinets && 
               cab.BrevetCabinets.type && 
               (cab.BrevetCabinets.type === 'procedure' || 
                cab.BrevetCabinets.type.toLowerCase().includes('proced'));
      });
      
      const annuiteCabinets = enrichedCabinets.filter(cab => {
        return cab.BrevetCabinets && 
               cab.BrevetCabinets.type && 
               (cab.BrevetCabinets.type === 'annuite' || 
                cab.BrevetCabinets.type.toLowerCase().includes('annuit'));
      });
      
      console.log(`Cabinets classés - Total: ${enrichedCabinets.length}, Procédure: ${procedureCabinets.length}, Annuité: ${annuiteCabinets.length}`);
      
      // Renvoyer toutes les données
      res.status(200).json({ 
        data: enrichedCabinets,
        procedure: procedureCabinets,
        annuite: annuiteCabinets,
        debug: {
          relations: brevetCabinets.length,
          typesRelations: brevetCabinets.map(rel => rel.type),
          cabinetsIds: cabinets.map(cab => cab.id),
          cabinetTypes: cabinets.map(cab => cab.type)
        }
      });
    } catch (error) {
      console.error('Erreur récupération cabinets par brevet:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des cabinets', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  // Nouvelle méthode pour récupérer la dernière date de mise à jour
  getLastUpdate: async (req, res) => {
    try {
      // Récupérer le brevet le plus récemment mis à jour
      const lastUpdated = await Brevet.findOne({
        order: [['updatedAt', 'DESC']],
        attributes: ['updatedAt']
      });
      
      // Si aucun brevet n'est trouvé, renvoyer la date actuelle
      const lastUpdate = lastUpdated ? lastUpdated.updatedAt : new Date();
      
      res.status(200).json({ 
        lastUpdate: lastUpdate.toISOString(),
        timestamp: lastUpdate.getTime()
      });
    } catch (error) {
      console.error('Erreur récupération date de dernière mise à jour:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la date de dernière mise à jour' });
    }
  }
};

module.exports = brevetController;
