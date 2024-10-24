// const Client = require('../models/clientModel');

// const clientController = {
//   createClient: (req, res) => {
//     const clientData = req.body;
//     Client.create(clientData, (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.status(201).json({ message: 'Client created successfully', data: results });
//     });
//   },

//   getAllClients: (req, res) => {
//     Client.getAll((err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.status(200).json({ data: results });
//     });
//   },

//   getClientById: (req, res) => {
//     const clientId = req.params.id;
//     Client.getById(clientId, (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.status(200).json({ data: results });
//     });
//   },

//   updateClient: (req, res) => {
//     const clientId = req.params.id;
//     const clientData = req.body;
//     Client.update(clientId, clientData, (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.status(200).json({ message: 'Client updated successfully', data: results });
//     });
//   },

//   deleteClient: (req, res) => {
//     const clientId = req.params.id;
//     Client.delete(clientId, (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.status(200).json({ message: 'Client deleted successfully', data: results });
//     });
//   }
// };

// module.exports = clientController;
const Client = require('../models/clientModel');

const clientController = {
  createClient: (req, res) => {
    const clientData = req.body;
    console.log("Received client data:", clientData);
    Client.create(clientData, (err, results) => {
      if (err) {
        console.error("Error creating client:", err);
        return res.status(500).json({ error: 'Error creating client' });
      }
      res.status(201).json({ message: 'Client created successfully', data: results });
    });
  },

  getAllClients: (req, res) => {
    Client.getAll((err, results) => {
      if (err) {
        console.error("Error fetching clients:", err);
        return res.status(500).json({ error: 'Error fetching clients' });
      }
      res.status(200).json({ data: results });
    });
  },

  getClientById: (req, res) => {
    const id = req.params.id;
    Client.getById(id, (err, results) => {
      if (err) {
        console.error("Error fetching client:", err);
        return res.status(500).json({ error: 'Error fetching client' });
      }
      res.status(200).json({ data: results });
    });
  },

  updateClient: (req, res) => {
    const id = req.params.id;
    const clientData = req.body;
    Client.update(id, clientData, (err, results) => {
      if (err) {
        console.error("Error updating client:", err);
        return res.status(500).json({ error: 'Error updating client' });
      }
      res.status(200).json({ message: 'Client updated successfully', data: results });
    });
  },

    getClientsByBrevetId: (req, res) => {
      const brevetId = req.params.brevetId;
      
      Client.getClientsByBrevetId(brevetId, (err, clients) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
        }
        res.status(200).json({ data: clients });
      });
    },






  deleteClient: (req, res) => {
    const id = req.params.id;
    Client.delete(id, (err, results) => {
      if (err) {
        console.error("Error deleting client:", err);
        return res.status(500).json({ error: 'Error deleting client' });
      }
      res.status(200).json({ message: 'Client deleted successfully', data: results });
    });
  }
};

module.exports = clientController;
