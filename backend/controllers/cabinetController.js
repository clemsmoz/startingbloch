const Cabinet = require('../models/cabinetModel');

const cabinetController = {
  createCabinet: (req, res) => {
    const cabinetData = req.body;
    Cabinet.create(cabinetData, (err, results) => {
      if (err) {
        console.error("Error creating cabinet:", err);
        return res.status(500).json({ error: 'Error creating cabinet' });
      }
      res.status(201).json({ message: 'Cabinet created successfully', data: results });
    });
  },

  getAllCabinets: (req, res) => {
    Cabinet.getAll((err, results) => {
      if (err) {
        console.error("Error fetching cabinets:", err);
        return res.status(500).json({ error: 'Error fetching cabinets' });
      }
      // Séparation des cabinets par type
      const procedureCabinets = results.filter(cabinet => cabinet.type === 'procedure');
      const annuiteCabinets = results.filter(cabinet => cabinet.type === 'annuite');
      res.status(200).json({ procedure: procedureCabinets, annuite: annuiteCabinets });
    });
  },

  getCabinetById: (req, res) => {
    const id = req.params.id;
    Cabinet.getById(id, (err, results) => {
      if (err) {
        console.error("Error fetching cabinet:", err);
        return res.status(500).json({ error: 'Error fetching cabinet' });
      }
      res.status(200).json({ data: results });
    });
  },

  updateCabinet: (req, res) => {
    const id = req.params.id;
    const cabinetData = req.body;
    Cabinet.update(id, cabinetData, (err, results) => {
      if (err) {
        console.error("Error updating cabinet:", err);
        return res.status(500).json({ error: 'Error updating cabinet' });
      }
      res.status(200).json({ message: 'Cabinet updated successfully', data: results });
    });
  },

  deleteCabinet: (req, res) => {
    const id = req.params.id;
    Cabinet.delete(id, (err, results) => {
      if (err) {
        console.error("Error deleting cabinet:", err);
        return res.status(500).json({ error: 'Error deleting cabinet' });
      }
      res.status(200).json({ message: 'Cabinet deleted successfully', data: results });
    });
  },

  getCabinetsByBrevetId: (req, res) => {
    const brevetId = req.query.id_brevet;

    if (!brevetId) {
        return res.status(400).send({ message: 'Missing id_brevet parameter' });
    }

    Cabinet.getByBrevetId(brevetId, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }

        res.status(200).send({ data: results });
    });
},

getAllCabinetReferences: (req, res) => {
  // Appel à la méthode du modèle Cabinet pour récupérer toutes les références
  Cabinet.getAllReferences((err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Erreur lors de la récupération des références de cabinets', error: err });
    }

    res.status(200).send({ data: results });
  });
}



  
}


module.exports = cabinetController;
