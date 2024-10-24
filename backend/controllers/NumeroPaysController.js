// controllers/NumeroPaysController.js
const NumeroPays = require('../models/NumeroPaysModel');

exports.getNumeroPaysByBrevetId = (req, res) => {
  const brevetId = req.query.id_brevet;
  
  if (!brevetId) {
    return res.status(400).json({
      success: false,
      message: 'Missing brevet ID'
    });
  }

  NumeroPays.getByBrevetId(brevetId, (err, data) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving numero pays data'
      });
    }

    res.status(200).json({
      success: true,
      data: data
    });
  });
};
