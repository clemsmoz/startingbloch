const db = require('../models');
const Inventeur = db.Inventeur;
const Op = db.Sequelize.Op;

const inventeurController = {
  createInventeur: async (req, res) => {
    try {
      const data = await Inventeur.create({
        nom_inventeur:       req.body.nom_inventeur       || null,
        prenom_inventeur:    req.body.prenom_inventeur    || null,
        email_inventeur:     req.body.email_inventeur     || null,
        telephone_inventeur: req.body.telephone_inventeur || null
      });
      res.status(201).json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  getAllInventeurs: async (req, res) => {
    const nom = req.query.nom;
    const condition = nom ? { nom_inventeur: { [Op.like]: `%${nom}%` } } : null;

    try {
      const data = await Inventeur.findAll({ 
        where: condition,
        include: [{
          model: db.Brevet
        }, {
          model: db.Pays
        }]
      });
      res.send(data);
    } catch (err) {
      res.status(500).send({
        message: err.message || "Une erreur est survenue lors de la récupération des inventeurs."
      });
    }
  },

  getInventeurById: async (req, res) => {
    const id = req.params.id;

    try {
      const data = await Inventeur.findByPk(id, {
        include: [{
          model: db.Brevet
        }, {
          model: db.Pays
        }]
      });
      
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Impossible de trouver l'inventeur avec id=${id}.`
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Erreur lors de la récupération de l'inventeur avec id=" + id
      });
    }
  },

  updateInventeur: async (req, res) => {
    const id = req.params.id;

    try {
      const num = await Inventeur.update({
        nom_inventeur:       req.body.nom_inventeur       || null,
        prenom_inventeur:    req.body.prenom_inventeur    || null,
        email_inventeur:     req.body.email_inventeur     || null,
        telephone_inventeur: req.body.telephone_inventeur || null
      }, {
        where: { id: id }
      });
      
      if (num == 1) {
        res.send({
          message: "L'inventeur a été mis à jour avec succès."
        });
      } else {
        res.send({
          message: `Impossible de mettre à jour l'inventeur avec id=${id}. Peut-être que l'inventeur n'a pas été trouvé ou req.body est vide!`
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Erreur lors de la mise à jour de l'inventeur avec id=" + id
      });
    }
  },

  deleteInventeur: async (req, res) => {
    const id = req.params.id;

    try {
      const num = await Inventeur.destroy({
        where: { id: id }
      });
      
      if (num == 1) {
        res.send({
          message: "L'inventeur a été supprimé avec succès!"
        });
      } else {
        res.send({
          message: `Impossible de supprimer l'inventeur avec id=${id}. Peut-être que l'inventeur n'a pas été trouvé!`
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Impossible de supprimer l'inventeur avec id=" + id
      });
    }
  }
};

module.exports = inventeurController;
