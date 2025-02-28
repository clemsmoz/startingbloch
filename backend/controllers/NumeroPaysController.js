const db = require('../models');
const NumeroPays = db.NumeroPays;
const Op = db.Sequelize.Op;

const NumeroPaysController = {
  createNumeroPays: async (req, res) => {
    // Validation de la requête
    if (!req.body.id_brevet) {
      return res.status(400).json({ message: "Le champ id_brevet est obligatoire!" });
    }

    // Création d'un NumeroPays
    const numeroPays = {
      id_brevet: req.body.id_brevet,
      numero_depot: req.body.numero_depot,
      numero_publication: req.body.numero_publication,
      id_pays: req.body.id_pays,
      alpha2: req.body.alpha2,
      id_statuts: req.body.id_statuts,
      date_depot: req.body.date_depot,
      date_delivrance: req.body.date_delivrance,
      numero_delivrance: req.body.numero_delivrance,
      licence: req.body.licence,
      nom_fr_fr: req.body.nom_fr_fr
    };

    try {
      const data = await NumeroPays.create(numeroPays);
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ message: err.message || "Une erreur est survenue lors de la création du NumeroPays." });
    }
  },

  getAllNumeroPays: async (req, res) => {
    const numero = req.query.numero;
    const condition = numero ? { numero_depot: { [Op.like]: `%${numero}%` } } : null;
    try {
      const data = await NumeroPays.findAll({
        where: condition,
        include: [
          { model: db.Brevet },
          { model: db.Pays },
          { model: db.Statuts }
        ]
      });
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: err.message || "Une erreur est survenue lors de la récupération des NumeroPays." });
    }
  },

  getNumeroPaysById: async (req, res) => {
    const id = req.params.id;
    try {
      const data = await NumeroPays.findByPk(id, {
        include: [
          { model: db.Brevet },
          { model: db.Pays },
          { model: db.Statuts }
        ]
      });
      if (!data) {
        return res.status(404).json({ message: `Impossible de trouver le NumeroPays avec id=${id}.` });
      }
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la récupération du NumeroPays avec id=" + id });
    }
  },

  getNumeroPaysByBrevetId: async (req, res) => {
    // On accepte id_brevet en paramètre ou en query
    const brevetId = req.params.id_brevet || req.query.id_brevet;
    if (!brevetId) {
      return res.status(400).json({ success: false, message: 'Missing brevet ID' });
    }
    try {
      const data = await NumeroPays.findAll({
        where: { id_brevet: brevetId },
        include: [
          { model: db.Pays },
          { model: db.Statuts }
        ]
      });
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Erreur récupération NumeroPays:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des NumeroPays' });
    }
  },

  updateNumeroPays: async (req, res) => {
    const id = req.params.id;
    try {
      const [num] = await NumeroPays.update(req.body, { where: { id: id } });
      if (num === 1) {
        res.status(200).json({ message: "Le NumeroPays a été mis à jour avec succès." });
      } else {
        res.status(400).json({ message: `Impossible de mettre à jour le NumeroPays avec id=${id}. Peut-être que le NumeroPays n'a pas été trouvé ou req.body est vide!` });
      }
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la mise à jour du NumeroPays avec id=" + id });
    }
  },

  deleteNumeroPays: async (req, res) => {
    const id = req.params.id;
    try {
      const num = await NumeroPays.destroy({ where: { id: id } });
      if (num === 1) {
        res.status(200).json({ message: "Le NumeroPays a été supprimé avec succès!" });
      } else {
        res.status(400).json({ message: `Impossible de supprimer le NumeroPays avec id=${id}. Peut-être que le NumeroPays n'a pas été trouvé!` });
      }
    } catch (err) {
      res.status(500).json({ message: "Impossible de supprimer le NumeroPays avec id=" + id });
    }
  }
};

module.exports = NumeroPaysController;
