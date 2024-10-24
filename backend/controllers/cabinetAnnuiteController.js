const CabinetAnnuite = require('../models/cabinetAnnuiteModel');

const cabinetAnnuiteController = {
  getAllCabinetsAnnuite: (req, res) => {
    CabinetAnnuite.getAll((err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ data: results });
    });
  },
  createCabinetAnnuite: (req, res) => {
    const newCabinet = req.body;
    CabinetAnnuite.create(newCabinet, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Cabinet created successfully', data: results });
    });
  }

  
};

module.exports = cabinetAnnuiteController;
