// controllers/NumeroPaysController.js
const NumeroPays = require('../models/Numero');

exports.getNumeroPaysByBrevetId = async (req, res) => {
  try {
    const brevetId = req.query.id_brevet;
    if (!brevetId) {
      return res.status(400).json({ success: false, message: 'Missing brevet ID' });
    }
    const data = await NumeroPays.findAll({ where: { brevetId } });
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erreur récupération numero pays:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des numero pays' });
  }
};
