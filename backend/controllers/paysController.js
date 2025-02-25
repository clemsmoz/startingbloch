const { Pays } = require('../models');

const paysController = {
  getAllPays: async (req, res) => {
    try {
      const results = await Pays.findAll();
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Erreur récupération pays:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des pays' });
    }
  }
};

module.exports = paysController;
