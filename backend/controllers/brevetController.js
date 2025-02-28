const { Brevet, Client, Titulaire, Deposant, Inventeur, Cabinet, NumeroPays, Pays, Statuts, sequelize } = require('../models');
const Op = sequelize.Sequelize.Op;

const brevetController = {
  createBrevet: async (req, res) => {
    try {
      const brevetData = { ...req.body };
      
      // Traitement des pièces jointes
      if (req.files) {
        brevetData.pieces_jointes = [];
        Object.keys(req.files).forEach(key => {
          const file = req.files[key];
          brevetData.pieces_jointes.push({
            nom_fichier: file.name,
            type_fichier: file.mimetype,
            donnees: file.data
          });
          console.log("Pièce jointe reçue :", file.name);
        });
      } else {
        brevetData.pieces_jointes = [];
        console.log("Aucune pièce jointe reçue");
      }

      // Parsing des champs complexes
      try {
        brevetData.clients = JSON.parse(brevetData.clients || '[]');
        brevetData.inventeurs = JSON.parse(brevetData.inventeurs || '[]');
        brevetData.titulaires = JSON.parse(brevetData.titulaires || '[]');
        brevetData.deposants = JSON.parse(brevetData.deposants || '[]');
        brevetData.pays = JSON.parse(brevetData.pays || '[]');
        brevetData.cabinets_procedure = JSON.parse(brevetData.cabinets_procedure || '[]');
        brevetData.cabinets_annuite = JSON.parse(brevetData.cabinets_annuite || '[]');
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", parseError);
        return res.status(400).json({ error: 'JSON invalide dans le corps de la requête' });
      }

      const result = await Brevet.create(brevetData);
      console.log('Brevet créé avec succès', result);
      res.status(201).json({ message: 'Brevet créé avec succès', data: result });
    } catch (error) {
      console.error("Erreur création brevet:", error);
      res.status(500).json({ error: 'Erreur lors de la création du brevet' });
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
  getPiecesJointesByBrevetId: async (req, res) => {
    try {
      const brevet = await Brevet.findByPk(req.params.id);
      if (!brevet) {
        return res.status(404).json({ message: 'Brevet non trouvé' });
      }
      const fichiers = brevet.pieces_jointes || [];
      if (!fichiers.length) {
        return res.status(404).json({ message: 'Aucune pièce jointe trouvée pour ce brevet' });
      }
      const fichiersBase64 = fichiers.map(result => ({
        nom_fichier: result.nom_fichier,
        type_fichier: result.type_fichier,
        donnees: result.donnees ? result.donnees.toString('base64') : null
      }));
      res.status(200).json({ data: fichiersBase64 });
    } catch (error) {
      console.error('Erreur récupération pièces jointes:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des pièces jointes' });
    }
  },
  getByClientId: async (req, res) => {
    try {
      const results = await Brevet.findAll({ where: { clientId: req.params.id } });
      res.status(200).json(results);
    } catch (error) {
      console.error('Erreur récupération brevets par client:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des brevets par client' });
    }
  },
  updateBrevet: async (req, res) => {
    try {
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

  // Version améliorée de getAllBrevets avec relations
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

  // Version améliorée de getBrevetById avec relations
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

  // Ajouter un titulaire à un brevet
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

  // Ajouter un inventeur à un brevet
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

  // Ajouter un déposant à un brevet
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
  }
};

module.exports = brevetController;
