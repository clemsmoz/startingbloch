const { Statut } = require('../models');

const statutsController = {
  getAllStatuts: async (req, res) => {
    try {
      const results = await Statut.findAll();
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération statuts:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des statuts' });
    }
  }
};

module.exports = statutsController;