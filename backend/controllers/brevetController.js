// Fonctions utilitaires pour les logs colorés et avec icônes
const logInfo = (...args) => console.log('\x1b[36m%s\x1b[0m', 'ℹ️', ...args);      // Cyan
const logSuccess = (...args) => console.log('\x1b[32m%s\x1b[0m', '✅', ...args);   // Vert
const logWarn = (...args) => console.warn('\x1b[33m%s\x1b[0m', '⚠️', ...args);     // Jaune
const logError = (...args) => console.error('\x1b[31m%s\x1b[0m', '❌', ...args);   // Rouge

const { Brevet, Client,Contact, Titulaire, Deposant, Inventeur, Cabinet, NumeroPays, Pays, Statuts, sequelize } = require('../models');
  const Op = sequelize.Sequelize.Op;
  const XLSX = require('xlsx');
  const fs = require('fs');
  const path = require('path');

const importStatusMap = {};

const parseContactField = (value) => {
  if (!value) return { nom: '', prenom: '', email: '' };
  let nom = '', prenom = '', email = '';
  const emailMatch = value.match(/<([^>]+)>/);
  if (emailMatch) {
    email = emailMatch[1].trim();
    value = value.replace(emailMatch[0], '').trim();
  }
  const parts = value.split(' ').filter(Boolean);
  if (parts.length === 1) {
    nom = parts[0];
  } else if (parts.length >= 2) {
    nom = parts[0];
    prenom = parts.slice(1).join(' ');
  }
  return { nom, prenom, email };
};

const splitMulti = (str, sep = ';') => {
  if (!str) return [];
  return str.split(sep).map(s => s.trim()).filter(Boolean);
};

// Utilitaire pour créer ou récupérer un statut
const getOrCreateStatut = async (statutName, transaction) => {
  if (!statutName) return null;
  const existing = await Statuts.findOne({
    where: sequelize.where(
      sequelize.fn('LOWER', sequelize.col('statuts')),
      sequelize.fn('LOWER', statutName.trim())
    )
  });
  if (existing) return existing.id;
  const created = await Statuts.create({ statuts: statutName.trim(), description: '' }, { transaction });
  return created.id;
};

  const brevetController = {
    createBrevet: async (req, res) => {
      const t = await sequelize.transaction(); // Créer une transaction
      
      try {
        logInfo("=== DÉBUT DE LA REQUÊTE ===");
        logInfo("Content-Type:", req.headers['content-type']);
        logInfo("Body keys:", Object.keys(req.body));
        logInfo("Body (brut):", req.body);
        
        // 1. Extraction des données de base du brevet
        const brevetData = {
          reference_famille: req.body.reference_famille || null,
          titre: req.body.titre || null,
          commentaire: req.body.commentaire || null
        };
        
        // Suppression de la vérification stricte pour permettre des valeurs nulles
        // On vérifie simplement qu'au moins l'un des champs est renseigné
        if (!req.body || Object.keys(req.body).length === 0) {
          logError("ERREUR: Aucune donnée fournie");
          return res.status(400).json({
            error: 'Aucune donnée fournie pour créer le brevet'
          });
        }
        
        // 3. Création du brevet avec logs détaillés
        logInfo("Données du brevet à créer:", JSON.stringify(brevetData, null, 2));
        const brevet = await Brevet.create(brevetData, { transaction: t });
        const brevetId = brevet.id;
        logSuccess("Brevet créé avec ID:", brevetId);
        
        // 4. Fonction de parsing améliorée pour les données JSON
        const parseJSONSafely = (data) => {
          if (!data) return [];
          if (Array.isArray(data)) return data;
          try {
            // Si c'est déjà un objet, on le retourne directement
            if (typeof data === 'object' && data !== null) return data;
            return JSON.parse(data);
          } catch (e) {
            logError('Erreur de parsing JSON:', e, 'Données reçues:', data);
            // Si le parsing échoue mais que data est une chaîne avec [, on tente de nettoyer
            if (typeof data === 'string' && data.includes('[')) {
              try {
                // Tentative de nettoyage des caractères spéciaux
                const cleanedData = data.replace(/\\/g, '').replace(/"\[/g, '[').replace(/\]"/g, ']');
                return JSON.parse(cleanedData);
              } catch (cleanError) {
                logError('Échec du nettoyage JSON:', cleanError);
              }
            }
            return [];
          }
        };
        
        // 4.1 Clients avec meilleure gestion des erreurs
        try {
          const clients = parseJSONSafely(req.body.clients);
          logInfo("Clients à associer (après parsing):", clients);

          // Correction : supporte aussi un seul client (id_client direct)
          let clientIds = [];
          if (Array.isArray(clients) && clients.length > 0) {
            clientIds = clients.map(c => c.id_client || c.id).filter(Boolean);
          } else if (clients && clients.id_client) {
            clientIds = [clients.id_client];
          }
          // Ajout de la liaison brevet-client pour chaque client sélectionné
          for (const clientId of clientIds) {
            if (clientId) {
              await sequelize.models.BrevetClients.findOrCreate({
                where: { BrevetId: brevetId, ClientId: clientId },
                transaction: t
              });
              logInfo(`Client associé: ${clientId}`);
            }
          }
        } catch (clientError) {
          logError("Erreur lors du traitement des clients:", clientError);
        }
        
        // 4.2 Informations de dépôt
        try {
          const informationsDepot = parseJSONSafely(req.body.informations_depot);
          logInfo("Informations de dépôt (après parsing):", informationsDepot);
          
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
                logInfo(`Information de dépôt ajoutée pour pays: ${info.id_pays}`);
              } else {
                logWarn("Information de dépôt invalide ignorée:", info);
              }
            }
          }
        } catch (depotError) {
          logError("Erreur lors du traitement des informations de dépôt:", depotError);
        }
        
        // 4.3 Inventeurs avec gestion unique de la colonne PaysId
        try {
          const inventeurs = parseJSONSafely(req.body.inventeurs);
          logInfo("Inventeurs à créer (après parsing):", inventeurs);
          
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
          logError("Erreur lors du traitement des inventeurs:", inventeurError);
        }
        
        // 4.4 Titulaires avec gestion unique de la colonne PaysId
        try {
          const titulaires = parseJSONSafely(req.body.titulaires);
          logInfo("Titulaires à créer (après parsing):", titulaires);
          
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
          logError("Erreur lors du traitement des titulaires:", titulaireError);
        }
        
        // 4.5 Déposants avec gestion unique de la colonne PaysId
        try {
          const deposants = parseJSONSafely(req.body.deposants);
          logInfo("Déposants à créer (après parsing):", deposants);
          
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
          logError("Erreur lors du traitement des déposants:", deposantError);
        }
        
        // 4.6 Cabinets de procédure avec meilleure gestion des erreurs
        try {
          const cabinetsProcedure = parseJSONSafely(req.body.cabinets_procedure);
          logInfo("Cabinets de procédure à associer (après parsing):", cabinetsProcedure);
          
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
          logError("Erreur lors du traitement des cabinets de procédure:", cabinetProcedureError);
        }
        
        // 4.7 Cabinets d'annuité avec meilleure gestion des erreurs
        try {
          const cabinetsAnnuite = parseJSONSafely(req.body.cabinets_annuite);
          logInfo("Cabinets d'annuité à associer (après parsing):", cabinetsAnnuite);
          
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
          logError("Erreur lors du traitement des cabinets d'annuité:", cabinetAnnuiteError);
        }
        
        // Valider la transaction et envoyer la réponse
        await t.commit();
        logSuccess("=== TRANSACTION VALIDÉE AVEC SUCCÈS ===");
        
        res.status(201).json({
          message: 'Brevet créé avec succès',
          data: brevet
        });
      } catch (error) {
        // Annuler la transaction en cas d'erreur
        await t.rollback();
        logError("=== ERREUR LORS DE LA CRÉATION DU BREVET ===");
        logError(error.name, error.message);
        logError(error.stack);
        
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
        logSuccess('Liste de tous les brevets récupérée');
        res.status(200).json({ data: results });
      } catch (error) {
        logError('Erreur récupération brevets:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des brevets' });
      }
    },

    getBrevetById: async (req, res) => {
      try {
        const result = await Brevet.findByPk(req.params.id);
        if (result) {
          logSuccess('Brevet trouvé:', req.params.id);
          res.status(200).json({ data: result });
        } else {
          logWarn('Brevet non trouvé:', req.params.id);
          res.status(404).json({ error: 'Brevet non trouvé' });
        }
      } catch (error) {
        logError('Erreur récupération brevet:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du brevet' });
      }
    },

    // Méthode corrigée pour récupérer les brevets d'un client via la table de jointure
    getByClientId: async (req, res) => {
      try {
        const clientId = req.params.id; // On suppose que la route est /brevets/client/:id
        logInfo(`Recherche des brevets pour le client ID: ${clientId}`);
        
        const brevets = await Brevet.findAll({
          include: [{
            model: Client,
            where: { id: clientId }
          }]
        });
        
        logSuccess(`Nombre de brevets trouvés pour le client ${clientId}: ${brevets.length}`);
        res.status(200).json({ data: brevets || [] }); // Garantit qu'on renvoie toujours un tableau
      } catch (error) {
        logError('Erreur récupération brevets par client:', error);
        res.status(500).json({ error: error.message });
      }
    },

    updateBrevet: async (req, res) => {
      try {
        // Vérifier si req.body contient des données
        if (!req.body || Object.keys(req.body).length === 0) {
          return res.status(400).json({ error: 'Aucune donnée fournie pour la mise à jour' });
        }
        
        logInfo(`Mise à jour du brevet ID: ${req.params.id} avec les données:`, req.body);
        
        const updatedFields = {
          reference_famille: req.body.reference_famille || null,
          titre: req.body.titre || null,
          commentaire: req.body.commentaire || null
        };
        const [count] = await Brevet.update(updatedFields, { where: { id: req.params.id } });
        if (!count) return res.status(404).json({ error: 'Brevet non trouvé' });
        const updated = await Brevet.findByPk(req.params.id);
        logSuccess('Brevet mis à jour:', req.params.id);
        res.status(200).json({ message: 'Brevet mis à jour', data: updated });
      } catch (error) {
        logError('Erreur mise à jour brevet:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du brevet' });
      }
    },

    deleteBrevet: async (req, res) => {
      try {
        const result = await Brevet.destroy({ where: { id: req.params.id } });
        if (result === 0) {
          logWarn('Brevet non trouvé pour suppression:', req.params.id);
          res.status(404).json({ error: 'Brevet non trouvé' });
        } else {
          logSuccess('Brevet supprimé avec succès:', req.params.id);
          res.status(200).json({ message: 'Brevet supprimé avec succès' });
        }
      } catch (error) {
        logError('Erreur suppression brevet:', error);
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
        logSuccess('Liste des brevets avec relations récupérée');
        res.status(200).json({ data: results });
      } catch (error) {
        logError('Erreur récupération brevets avec relations:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des brevets' });
      }
    },

    getBrevetByIdWithRelations: async (req, res) => {
      try {
        // Récupérer le brevet avec toutes ses relations
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
              model: Pays,
              required: false
            }, {
              model: Statuts,
              required: false
            }]
          }]
        });
    
        if (result) {
          logSuccess('Brevet avec relations trouvé:', req.params.id);
          // Restructuration des données pour inclure le statut dans chaque pays
          const restructuredResult = {
            ...result.toJSON(),
            NumeroPays: result.NumeroPays.map(np => ({
              ...np.toJSON(),
              Pay: np.Pay,
              Statut: np.Statuts || null  // S'assurer que le statut est inclus
            }))
          };
    
          logInfo("Données restructurées:", {
            nombrePays: restructuredResult.NumeroPays.length,
            exemple: restructuredResult.NumeroPays[0]
          });
    
          res.status(200).json({ data: restructuredResult });
        } else {
          logWarn('Brevet non trouvé:', req.params.id);
          res.status(404).json({ error: 'Brevet non trouvé' });
        }
      } catch (error) {
        logError('Erreur récupération brevet avec relations:', error);
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
        logError('Erreur ajout titulaire:', error);
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
        logError('Erreur ajout inventeur:', error);
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
        logError('Erreur ajout déposant:', error);
        res.status(500).json({ error: 'Une erreur est survenue lors de l\'ajout du déposant au brevet' });
      }
    },

    getClientsByBrevetId: async (req, res) => {
      try {
        const brevetId = req.params.id;
        logInfo(`Recherche des clients pour le brevet ID: ${brevetId}`);
        
        const brevet = await Brevet.findByPk(brevetId, {
          include: [{
            model: Client
          }]
        });
        
        if (!brevet) {
          return res.status(404).json({ error: 'Brevet non trouvé' });
        }
        
        logSuccess(`Nombre de clients trouvés pour le brevet ${brevetId}: ${brevet.Clients?.length || 0}`);
        res.status(200).json(brevet.Clients || []);
      } catch (error) {
        logError('Erreur récupération clients par brevet:', error);
        res.status(500).json({ error: error.message });
      }
    },

    // Nouvelle méthode pour récupérer les statuts d'un brevet
    getStatutsByBrevetId: async (req, res) => {
      try {
        const brevetId = req.params.id;
        logInfo(`Recherche des statuts pour le brevet ID: ${brevetId}`);
        
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
        
        logSuccess(`Nombre de statuts trouvés pour le brevet ${brevetId}: ${statuts.length}`);
        res.status(200).json(statuts);
      } catch (error) {
        logError('Erreur récupération statuts par brevet:', error);
        res.status(500).json({ error: error.message });
      }
    },

    // Nouvelle méthode pour récupérer les inventeurs d'un brevet
    getInventeursByBrevetId: async (req, res) => {
      try {
        const brevetId = req.params.id;
        logInfo(`Recherche des inventeurs pour le brevet ID: ${brevetId}`);
        
        const brevet = await Brevet.findByPk(brevetId, {
          include: [{
            model: Inventeur,
            include: [{ model: Pays }] // Inclure les pays associés aux inventeurs
          }]
        });
        
        if (!brevet) {
          return res.status(404).json({ error: 'Brevet non trouvé' });
        }
        
        logSuccess(`Nombre d'inventeurs trouvés pour le brevet ${brevetId}: ${brevet.Inventeurs?.length || 0}`);
        res.status(200).json(brevet.Inventeurs || []);
      } catch (error) {
        logError('Erreur récupération inventeurs par brevet:', error);
        res.status(500).json({ error: error.message });
      }
    },

    // Nouvelle méthode pour récupérer les titulaires d'un brevet
    getTitulairesByBrevetId: async (req, res) => {
      try {
        const brevetId = req.params.id;
        logInfo(`Recherche des titulaires pour le brevet ID: ${brevetId}`);
        
        const brevet = await Brevet.findByPk(brevetId, {
          include: [{
            model: Titulaire,
            include: [{ model: Pays }] // Inclure les pays associés aux titulaires
          }]
        });
        
        if (!brevet) {
          return res.status(404).json({ error: 'Brevet non trouvé' });
        }
        
        logSuccess(`Nombre de titulaires trouvés pour le brevet ${brevetId}: ${brevet.Titulaires?.length || 0}`);
        res.status(200).json(brevet.Titulaires || []);
      } catch (error) {
        logError('Erreur récupération titulaires par brevet:', error);
        res.status(500).json({ error: error.message });
      }
    },

    // Nouvelle méthode pour récupérer les déposants d'un brevet
    getDeposantsByBrevetId: async (req, res) => {
      try {
        const brevetId = req.params.id;
        logInfo(`Recherche des déposants pour le brevet ID: ${brevetId}`);
        
        const brevet = await Brevet.findByPk(brevetId, {
          include: [{
            model: Deposant,
            include: [{ model: Pays }] // Inclure les pays associés aux déposants
          }]
        });
        
        if (!brevet) {
          return res.status(404).json({ error: 'Brevet non trouvé' });
        }
        
        logSuccess(`Nombre de déposants trouvés pour le brevet ${brevetId}: ${brevet.Deposants?.length || 0}`);
        res.status(200).json(brevet.Deposants || []);
      } catch (error) {
        logError('Erreur récupération déposants par brevet:', error);
        res.status(500).json({ error: error.message });
      }
    },

    // Méthode améliorée pour récupérer tous les cabinets d'un brevet
    getAllCabinetsByBrevetId: async (req, res) => {
      try {
        const brevetId = req.params.id;
        logInfo(`Recherche de tous les cabinets pour le brevet ID: ${brevetId}`);
        
        // Récupérer d'abord les relations BrevetCabinets
        const brevetCabinets = await sequelize.models.BrevetCabinets.findAll({
          where: { BrevetId: brevetId },
          raw: true
        });
        
        if (!brevetCabinets || brevetCabinets.length === 0) {
          logWarn(`Aucune relation cabinet trouvée pour le brevet ${brevetId}`);
          return res.status(200).json({ 
            data: [], 
            procedure: [], 
            annuite: [] 
          });
        }
        
        // Log détaillé des relations trouvées
        logInfo(`Relations cabinet trouvées: ${brevetCabinets.length}`);
        logInfo("Types trouvés:", [...new Set(brevetCabinets.map(rel => rel.type))]);
        
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
        
        logInfo(`Cabinets récupérés: ${cabinets.length}, relations pays: ${cabinetPaysRelations.length}`);
        
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
        
        logSuccess(`Cabinets classés - Total: ${enrichedCabinets.length}, Procédure: ${procedureCabinets.length}, Annuité: ${annuiteCabinets.length}`);
        
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
        logError('Erreur récupération cabinets par brevet:', error);
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
        logError('Erreur récupération date de dernière mise à jour:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la date de dernière mise à jour' });
      }
    },
importFromExcel: async (req, res) => {
  const importId = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  importStatusMap[importId] = { status: 'processing', progress: 0 };

  try {
    if (!req.file) throw new Error('Aucun fichier Excel fourni.');

    const workbook = XLSX.readFile(req.file.path, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: true, defval: null });
    if (!rows.length) throw new Error('Excel vide.');

    const headers = Object.keys(rows[0]);
    logInfo('\n=== ANALYSE DU FICHIER EXCEL ===');
    logInfo('Headers trouvés:', headers);
    logInfo('\nPremière ligne complète:', JSON.stringify(rows[0], null, 2));

    // Mapping explicite des colonnes utiles avec plus de logs
    const excelMapping = {
      reference_famille: headers.find(h => h.trim().toLowerCase() === "référence famille"),
      titre: headers.find(h => h.trim().toLowerCase() === "titre"),
      pays_depot: headers.find(h => h.trim().toLowerCase().startsWith("pays")),
      cabinet_procedure: headers.find(h => h.trim().toLowerCase().includes("cabinet procédures") || h.trim().toLowerCase().includes("cabinet procedure")),
      cabinet_annuite: headers.find(h => h.trim().toLowerCase().includes("cabinet annuités") || h.trim().toLowerCase().includes("cabinet annuite")),
      contact_procedure: headers.find(h => h.trim().toLowerCase() === "contact email cpi"),
      contact_annuite: headers.find(h => h.trim().toLowerCase() === "contact email"),
      // Ajout du mapping pour les titulaires
      titulaire: headers.find(h => h.trim().toLowerCase() === "titulaire"),
      statut: headers.find(h => h.trim().toLowerCase() === "statut"),
      numero_publication: headers.find(h => h.trim().toLowerCase() === "numéro de publication"),
      date_depot: headers.find(h => h.trim().toLowerCase() === "date de dépôt"),
    };

    logInfo('\nMapping des colonnes:', JSON.stringify(excelMapping, null, 2));

    // Log détaillé pour chaque ligne
    rows.forEach((row, index) => {
      logInfo(`\n=== LIGNE ${index + 1} ===`);
      logInfo('Pays:', row[excelMapping.pays_depot]);
      logInfo('Cabinet Procédure:', row[excelMapping.cabinet_procedure]);
      logInfo('Cabinet Annuité:', row[excelMapping.cabinet_annuite]);
      logInfo('Contact Procédure:', row[excelMapping.contact_procedure]);
      logInfo('Contact Annuité:', row[excelMapping.contact_annuite]);
    });

    const [allPays] = await Promise.all([
      Pays.findAll()
    ]);
    // Fonction de normalisation pour matcher les pays
    const normalize = (str) =>
      (str || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();

    // Map: clé = nom pays normalisé (français ou anglais), valeur = id
    const paysMap = new Map();
    for (const p of allPays) {
      if (p.nom_fr_fr) paysMap.set(normalize(p.nom_fr_fr), p.id);
      if (p.nom_en_gb) paysMap.set(normalize(p.nom_en_gb), p.id);
    }
    // Cas particuliers pour les noms anglais courants ou abréviations
    const specialCountryCases = {
      usa: ['usa', 'us', 'unitedstates', 'unitedstatesofamerica', 'etatsunis', 'étatsunis'],
      uk: ['uk', 'unitedkingdom', 'greatbritain', 'royaumeuni'],
      southkorea: ['southkorea', 'korea', 'republiquedecoreedusud', 'coreedusud'],
      northkorea: ['northkorea', 'coreedunord', 'republiquedemocratiquedecoree'],
      china: ['china', 'chine'],
      japan: ['japan', 'japon'],
      germany: ['germany', 'allemagne'],
      france: ['france'],
      italy: ['italy', 'italie'],
      spain: ['spain', 'espagne'],
      mexico: ['mexico', 'mexique'],
      canada: ['canada'],
      australia: ['australia', 'australie'],
      netherlands: ['netherlands', 'paysbas'],
      belgium: ['belgium', 'belgique'],
      switzerland: ['switzerland', 'suisse'],
      austria: ['austria', 'autriche'],
      russia: ['russia', 'russie'],
      brazil: ['brazil', 'bresil', 'brésil'],
      india: ['india', 'inde']
      // Ajoute d'autres cas si besoin
    };
    // Inverse la map pour retrouver l'id du pays à partir d'un alias
    const aliasToPaysId = {};
    for (const [key, id] of paysMap.entries()) {
      for (const [main, aliases] of Object.entries(specialCountryCases)) {
        if (aliases.includes(key)) {
          aliasToPaysId[main] = id;
        }
      }
    }

    let count = 0;
    const brevetMap = new Map(); // refFamille -> brevet instance

    for (const row of rows) {
      const refFam = excelMapping.reference_famille ? row[excelMapping.reference_famille]?.toString().trim() : '';
      if (!refFam) continue;

      const tnx = await sequelize.transaction();
      try {
        let brevet;
        let isFirstOccurrence = false;

        if (brevetMap.has(refFam)) {
          brevet = brevetMap.get(refFam);
          logInfo(`[IMPORT EXCEL] Brevet déjà existant pour refFam "${refFam}" (id: ${brevet.id})`);
        } else {
          // Créer le brevet et les entités associées (cabinet, titulaire, etc.) une seule fois
          const [createdBrevet] = await Brevet.findOrCreate({
            where: { reference_famille: refFam },
            defaults: {
              titre: excelMapping.titre ? (row[excelMapping.titre]?.toString().trim() || '') : '',
              commentaire: '' // Pas de colonne commentaire dans ton Excel
            },
            transaction: tnx
          });
          brevet = createdBrevet;
          brevetMap.set(refFam, brevet);
          isFirstOccurrence = true;
          logInfo(`[IMPORT EXCEL] Nouveau brevet créé pour refFam "${refFam}" (id: ${brevet.id})`);
        }

        // === AJOUT : Lier le brevet aux clients sélectionnés ===
        // Récupération des clients depuis la requête (support JSON ou stringifié)
        let clientIds = [];
        if (req.body.client_ids) {
          if (typeof req.body.client_ids === 'string') {
            try {
              clientIds = JSON.parse(req.body.client_ids);
            } catch {
              clientIds = [];
            }
          } else if (Array.isArray(req.body.client_ids)) {
            clientIds = req.body.client_ids;
          }
        }
        // Si pas de client_ids, essaie req.body.clients (compatibilité)
        if (!clientIds.length && req.body.clients) {
          if (typeof req.body.clients === 'string') {
            try {
              clientIds = JSON.parse(req.body.clients).map(c => c.id_client || c.id);
            } catch {
              clientIds = [];
            }
          } else if (Array.isArray(req.body.clients)) {
            clientIds = req.body.clients.map(c => c.id_client || c.id);
          }
        }
        // Ajoute la liaison brevet-client pour chaque client sélectionné
        if (isFirstOccurrence && brevet && clientIds && clientIds.length > 0) {
          for (const clientId of clientIds) {
            if (clientId) {
              await sequelize.models.BrevetClients.findOrCreate({
                where: { BrevetId: brevet.id, ClientId: clientId },
                transaction: tnx
              });
            }
          }
        }

        // --- CORRECTION ICI : un seul pays par ligne ---
        let paysDepot = '';
        let numeroDepot = null;
        if (excelMapping.pays_depot && row[excelMapping.pays_depot]) {
          paysDepot = row[excelMapping.pays_depot].toString().trim();
        }
        // Normalisation pour la recherche du pays
        let paysId = null;
        if (paysDepot) {
          // Séparer le pays et le numéro de dépôt (ils sont séparés par \n)
          const [paysInfo, numeroDepotBrut] = paysDepot.toString().split('\n');
          const normPaysDepot = normalize(paysInfo);
          paysId = paysMap.get(normPaysDepot);

          // Récupérer le statut
          let statutId = null;
          if (excelMapping.statut && row[excelMapping.statut]) {
            const statutName = row[excelMapping.statut].toString().trim();
            if (statutName && statutName.toLowerCase() !== 'aucun') {
              statutId = await getOrCreateStatut(statutName, tnx);
            }
          }

          // Formater la date de dépôt
          let dateDepot = null;
          if (excelMapping.date_depot && row[excelMapping.date_depot]) {
            const dateStr = row[excelMapping.date_depot].toString().trim();
            try {
              // Mapping des mois en français abrégés
              const moisFr = {
                'janv': '01', 'févr': '02', 'mars': '03', 'avr': '04', 
                'mai': '05', 'juin': '06', 'juil': '07', 'août': '08', 
                'sept': '09', 'oct': '10', 'nov': '11', 'déc': '12'
              };
              
              // Format d'entrée: "21-févr.-13"
              const [jour, moisAbr, annee] = dateStr.split('-');
              const mois = moisFr[moisAbr.toLowerCase().replace('.', '')];
              const anneeComplete = '20' + annee.replace('.', '');
              
              // Formatage au format SQLite : YYYY-MM-DD
              dateDepot = `${anneeComplete}-${mois}-${jour.padStart(2, '0')}`;
              
              logInfo(`[IMPORT EXCEL] Conversion date: ${dateStr} -> ${dateDepot}`);
            } catch(e) {
              logWarn('Erreur parsing date:', dateStr, e);
              dateDepot = null;
            }
          }

          if (paysId) {
            // Récupérer le statut depuis la cellule statut
            let statutId = null;
            if (row[excelMapping.statut]) {
              const statutName = row[excelMapping.statut].toString().trim();
              logInfo(`[IMPORT EXCEL] Statut trouvé: "${statutName}"`);
              if (statutName && statutName.toLowerCase() !== 'aucun') {
                statutId = await getOrCreateStatut(statutName, tnx);
                logInfo(`[IMPORT EXCEL] ID Statut: ${statutId}`);
              }
            }

            logInfo(`[IMPORT EXCEL] Création NumeroPays: brevetId=${brevet.id} paysId=${paysId} refFam="${refFam}" statutId=${statutId}`);
            await NumeroPays.create({
              id_brevet: brevet.id,
              id_pays: paysId,
              numero_depot: numeroDepotBrut ? numeroDepotBrut.trim() : null,
              numero_publication: excelMapping.numero_publication ? (row[excelMapping.numero_publication]?.toString().trim() || null) : null,
              date_depot: dateDepot,
              id_statuts: statutId, // Ajout du statutId ici
              date_delivrance: null,
              numero_delivrance: null
            }, { transaction: tnx });

            // Liaison du pays avec le cabinet de procédure si présent
            if (row[excelMapping.cabinet_procedure]) {
              const cabinetName = row[excelMapping.cabinet_procedure].toString().trim();
              if (cabinetName.toLowerCase() !== 'aucune' && cabinetName !== '') {
                const cabinet = await Cabinet.findOne({
                  where: sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('nom_cabinet')),
                    sequelize.fn('LOWER', cabinetName)
                  ),
                  transaction: tnx
                });

                if (cabinet) {
                  // Vérifier si la liaison existe déjà
                  const existingLink = await sequelize.models.CabinetPays.findOne({
                    where: {
                      CabinetId: cabinet.id,
                      PaysId: paysId
                    },
                    transaction: tnx
                  });

                  if (!existingLink) {
                    await sequelize.models.CabinetPays.create({
                      CabinetId: cabinet.id,
                      PaysId: paysId
                    }, { transaction: tnx });
                    logInfo(`[IMPORT EXCEL] Liaison créée entre cabinet "${cabinetName}" et pays ID ${paysId}`);
                  }
                }
              }
            }

            // Liaison du pays avec le cabinet d'annuité si présent
            if (row[excelMapping.cabinet_annuite]) {
              const cabinetName = row[excelMapping.cabinet_annuite].toString().trim();
              if (cabinetName.toLowerCase() !== 'aucune' && cabinetName !== '') {
                const cabinet = await Cabinet.findOne({
                  where: sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('nom_cabinet')),
                    sequelize.fn('LOWER', cabinetName)
                  ),
                  transaction: tnx
                });

                if (cabinet) {
                  // Vérifier si la liaison existe déjà
                  const existingLink = await sequelize.models.CabinetPays.findOne({
                    where: {
                      CabinetId: cabinet.id,
                      PaysId: paysId
                    },
                    transaction: tnx
                  });

                  if (!existingLink) {
                    await sequelize.models.CabinetPays.create({
                      CabinetId: cabinet.id,
                      PaysId: paysId
                    }, { transaction: tnx });
                    logInfo(`[IMPORT EXCEL] Liaison créée entre cabinet "${cabinetName}" et pays ID ${paysId}`);
                  }
                }
              }
            }
          }
        }

        // Les entités suivantes sont ajoutées uniquement lors de la première occurrence
        if (isFirstOccurrence) {
          // Titulaires (peut être plusieurs séparés par virgule)
          if (excelMapping.titulaire && row[excelMapping.titulaire]) {
            const titulaires = row[excelMapping.titulaire].split(',').map(t => t.trim()).filter(Boolean);
            for (const nom of titulaires) {
              if (nom) {
                const [titulaire] = await Titulaire.findOrCreate({
                  where: { nom_titulaire: nom },
                  transaction: tnx
                });
                await brevet.addTitulaire(titulaire, { transaction: tnx });
              }
            }
          }
        }

        // --- DÉPLACER LA LOGIQUE CABINETS/CONTACTS HORS DU if (isFirstOccurrence) ---
        // Cabinets de procédure
        if (excelMapping.cabinet_procedure && row[excelMapping.cabinet_procedure]) {
          const cabinetName = row[excelMapping.cabinet_procedure].toString().trim();
          logInfo(`[IMPORT EXCEL] Traitement cabinet procédure: "${cabinetName}" pour refFam="${refFam}"`);
          if (cabinetName.toLowerCase() !== 'aucune' && cabinetName !== '') {
            let cabinet = await Cabinet.findOne({
              where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('nom_cabinet')),
                sequelize.fn('LOWER', cabinetName)
              ),
              transaction: tnx
            });

            if (!cabinet) {
              logInfo(`[IMPORT EXCEL] Création nouveau cabinet procédure: "${cabinetName}"`);
              cabinet = await Cabinet.create({
                nom_cabinet: cabinetName,
                type: 'procedure'
              }, { transaction: tnx });
            }

            // --- Correction : gestion contact procédure ---
            let contactId = null;
            if (excelMapping.contact_procedure && row[excelMapping.contact_procedure]) {
              const contactInfo = row[excelMapping.contact_procedure].toString().trim();
              logInfo(`[IMPORT EXCEL] Traitement contact procédure: "${contactInfo}"`);
              if (contactInfo.toLowerCase() !== 'aucune' && contactInfo !== '') {
                const { nom, prenom, email } = parseContactField(contactInfo);
                let contact = null;
                if (email) {
                  contact = await Contact.findOne({
                    where: { email_contact: email, cabinet_id: cabinet.id },
                    transaction: tnx
                  });
                }
                if (!contact && nom) {
                  // Recherche par nom/prénom/cabinet uniquement si nom existe
                  contact = await Contact.findOne({
                    where: {
                      nom_contact: nom,
                      prenom_contact: prenom,
                      cabinet_id: cabinet.id
                    },
                    transaction: tnx
                  });
                }
                if (!contact) {
                  // Création du contact uniquement s'il n'existe pas déjà
                  contact = await Contact.create({
                    nom_contact: nom,
                    prenom_contact: prenom,
                    email_contact: email,
                    cabinet_id: cabinet.id
                  }, { transaction: tnx });
                }
                contactId = contact.id;
              }
            }

            // Création de l'association cabinet-brevet avec le contact
            logInfo(`[IMPORT EXCEL] Avant BrevetCabinets.create: BrevetId=${brevet.id}, CabinetId=${cabinet.id}, type=procedure`);
            // Vérification existence avant création pour éviter l'erreur d'unicité
            const exists = await sequelize.models.BrevetCabinets.findOne({
              where: { BrevetId: brevet.id, CabinetId: cabinet.id, type: 'procedure' },
              transaction: tnx
            });
            if (exists) {
              logWarn(`[IMPORT EXCEL] Association BrevetCabinets déjà existante pour BrevetId=${brevet.id} CabinetId=${cabinet.id} (type=procedure)`);
            } else {
              await sequelize.models.BrevetCabinets.create({
                BrevetId: brevet.id,
                CabinetId: cabinet.id,
                contact_id: contactId,
                type: 'procedure'
              }, { transaction: tnx });
              logInfo(`[IMPORT EXCEL] Association BrevetCabinets créée pour BrevetId=${brevet.id} CabinetId=${cabinet.id} (type=procedure)`);
            }
          }
        }

        // Même logique pour les cabinets d'annuité
        if (excelMapping.cabinet_annuite && row[excelMapping.cabinet_annuite]) {
          const cabinetName = row[excelMapping.cabinet_annuite].toString().trim();
          logInfo(`[IMPORT EXCEL] Traitement cabinet annuité: "${cabinetName}" pour refFam="${refFam}"`);
          if (cabinetName.toLowerCase() !== 'aucune' && cabinetName !== '') {
            let cabinet = await Cabinet.findOne({
              where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('nom_cabinet')),
                sequelize.fn('LOWER', cabinetName)
              ),
              transaction: tnx
            });

            if (!cabinet) {
              logInfo(`[IMPORT EXCEL] Création nouveau cabinet annuité: "${cabinetName}"`);
              cabinet = await Cabinet.create({
                nom_cabinet: cabinetName,
                type: 'annuite'
              }, { transaction: tnx });
            }

            // --- Correction : gestion contact annuité ---
            let contactId = null;
            if (excelMapping.contact_annuite && row[excelMapping.contact_annuite]) {
              const contactInfo = row[excelMapping.contact_annuite].toString().trim();
              logInfo(`[IMPORT EXCEL] Traitement contact annuité: "${contactInfo}"`);
              if (contactInfo.toLowerCase() !== 'aucune' && contactInfo !== '') {
                const { nom, prenom, email } = parseContactField(contactInfo);
                let contact = null;
                if (email) {
                  contact = await Contact.findOne({
                    where: { email_contact: email, cabinet_id: cabinet.id },
                    transaction: tnx
                  });
                }
                if (!contact && nom) {
                  contact = await Contact.findOne({
                    where: {
                      nom_contact: nom,
                      prenom_contact: prenom,
                      cabinet_id: cabinet.id
                    },
                    transaction: tnx
                  });
                }
                if (!contact) {
                  contact = await Contact.create({
                    nom_contact: nom,
                    prenom_contact: prenom,
                    email_contact: email,
                    cabinet_id: cabinet.id
                  }, { transaction: tnx });
                }
                contactId = contact.id;
              }
            }

            // Création de l'association cabinet-brevet avec le contact
            logInfo(`[IMPORT EXCEL] Avant BrevetCabinets.create: BrevetId=${brevet.id}, CabinetId=${cabinet.id}, type=annuite`);
            const exists = await sequelize.models.BrevetCabinets.findOne({
              where: { BrevetId: brevet.id, CabinetId: cabinet.id, type: 'annuite' },
              transaction: tnx
            });
            if (exists) {
              logWarn(`[IMPORT EXCEL] Association BrevetCabinets déjà existante pour BrevetId=${brevet.id} CabinetId=${cabinet.id} (type=annuite)`);
            } else {
              await sequelize.models.BrevetCabinets.create({
                BrevetId: brevet.id,
                CabinetId: cabinet.id,
                contact_id: contactId,
                type: 'annuite'
              }, { transaction: tnx });
              logInfo(`[IMPORT EXCEL] Association BrevetCabinets créée pour BrevetId=${brevet.id} CabinetId=${cabinet.id} (type=annuite)`);
            }
          }
        }

        await tnx.commit();
        count++;
      } catch (err) {
        await tnx.rollback();
        logError(`[IMPORT EXCEL] Erreur pour la référence famille : ${refFam}`, err);
      }

      importStatusMap[importId] = {
        status: 'processing',
        progress: Math.round(count / rows.length * 100)
      };
    }

    fs.unlinkSync(req.file.path);
    importStatusMap[importId] = { status: 'done', progress: 100 };
    return res.json({ importId, total: rows.length, imported: count });

  } catch (e) {
    importStatusMap[importId] = { status: 'error', message: e.message };
    return res.status(500).json({ error: e.message });
  }
},



  getImportStatus: (req, res) => {
    const status = importStatusMap[req.params.importId];
    if (!status) return res.status(404).json({ status: 'not_found' });
    res.json(status);
  }
};

  module.exports = brevetController;
