const Pays = require('../models/paysModel');

const paysController = {
  getAllPays: (req, res) => {
    Pays.getAll((err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ data: results });
    });
  },
};

module.exports = paysController;

