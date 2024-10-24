const CabinetProcedure = require('../models/cabinetProcedureModel');

const cabinetProcedureController = {
  getAllCabinetsProcedure: (req, res) => {
    CabinetProcedure.getAll((err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ data: results });
    });
  },
  createCabinetProcedure: (req, res) => {
    const newCabinet = req.body;
    CabinetProcedure.create(newCabinet, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Cabinet created successfully', data: results });
    });
  }
};

module.exports = cabinetProcedureController;
