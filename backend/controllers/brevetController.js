// const Brevet = require('../models/brevetModel');

// const brevetController = { 
//   createBrevet: (req, res) => {
//     const brevetData = req.body;
//     console.log("Received brevet data:", brevetData);
//     Brevet.create(brevetData, (err, results) => {
//       if (err) {
//         console.error("Error creating brevet:", err);
//         return res.status(500).json({ error: 'Error creating brevet' });
//       }
//       res.status(201).json({ message: 'Brevet created successfully', data: results });
//     });
//   },

//   getAllBrevets: (req, res) => {
//     Brevet.getAll((err, results) => {
//       if (err) {
//         console.error("Error fetching brevets:", err);
//         return res.status(500).json({ error: 'Error fetching brevets' });
//       }
//       res.status(200).json({ data: results });
//     });
//   },

//   getBrevetById: (req, res) => {
//     const id = req.params.id;
//     Brevet.getById(id, (err, results) => {
//       if (err) {
//         console.error("Error fetching brevet:", err);
//         return res.status(500).json({ error: 'Error fetching brevet' });
//       }
//       res.status(200).json({ data: results });
//     });
//   },

  
//   getByClientId: (req, res) => {
//     const clientId = req.params.id; // Utilisez req.params.id pour obtenir l'id du client depuis l'URL
//     Brevet.getByClientId(clientId, (err, results) => {
//       if (err) {
//         console.error("Error fetching brevet:", err);
//         return res.status(500).json({ error: 'Error fetching brevet' });
//       }
//       res.status(200).json(results);
//     });
// },



//   updateBrevet: (req, res) => {
//     const id = req.params.id;
//     const brevetData = req.body;
//     Brevet.update(id, brevetData, (err, results) => {
//       if (err) {
//         console.error("Error updating brevet:", err);
//         return res.status(500).json({ error: 'Error updating brevet' });
//       }
//       res.status(200).json({ message: 'Brevet updated successfully', data: results });
//     });
//   },

//   deleteBrevet: (req, res) => {
//     const id = req.params.id;
//     Brevet.delete(id, (err, results) => {
//       if (err) {
//         console.error("Error deleting brevet:", err);
//         return res.status(500).json({ error: 'Error deleting brevet' });
//       }
//       res.status(200).json({ message: 'Brevet deleted successfully', data: results });
//     });
//   }
// };

// module.exports = brevetController;
const Brevet = require('../models/brevetModel');

const brevetController = {
  createBrevet: (req, res) => {
    const brevetData = req.body;
    console.log("Received brevet data:", brevetData);

    // Gestion des pièces jointes
    if (req.files) {
        brevetData.pieces_jointes = [];

        // Parcourir toutes les clés de `req.files` pour extraire les fichiers
        Object.keys(req.files).forEach((key) => {
            const file = req.files[key];
            brevetData.pieces_jointes.push({
                nom_fichier: file.name,
                type_fichier: file.mimetype,
                donnees: file.data
            });
            console.log("Piece jointe received:", file.name);
        });

        if (brevetData.pieces_jointes.length === 0) {
            console.log("No valid piece jointe found in the request");
        }
    } else {
        brevetData.pieces_jointes = [];
        console.log("No piece jointe received");
    }

    // Parsing des champs complexes
    try {
        brevetData.clients = JSON.parse(brevetData.clients || '[]');
        brevetData.inventeurs = JSON.parse(brevetData.inventeurs || '[]');
        brevetData.titulaires = JSON.parse(brevetData.titulaires || '[]');
        brevetData.deposants = JSON.parse(brevetData.deposants || '[]');
        brevetData.pays = JSON.parse(brevetData.pays || '[]');
        brevetData.cabinets_procedure = JSON.parse(brevetData.cabinets_procedure || '[]');
        brevetData.cabinets_annuite = JSON.parse(brevetData.cabinets_annuite || '[]');
    } catch (error) {
        console.error("Error parsing JSON fields:", error);
        return res.status(400).json({ error: 'Invalid JSON in request body' });
    }

    // Appeler la méthode create du modèle Brevet
    Brevet.create(brevetData, (err, results) => {
        if (err) {
            console.error("Error creating brevet:", err);
            return res.status(500).json({ error: 'Error creating brevet' });
        }
        res.status(201).json({ message: 'Brevet created successfully', data: results });
    });
},




  getAllBrevets: (req, res) => {
    Brevet.getAll((err, results) => {
      if (err) {
        console.error("Error fetching brevets:", err);
        return res.status(500).json({ error: 'Error fetching brevets' });
      }
      res.status(200).json({ data: results });
    });
  },

  getBrevetById: (req, res) => {
    const id = req.params.id;
    Brevet.getById(id, (err, results) => {
      if (err) {
        console.error("Error fetching brevet:", err);
        return res.status(500).json({ error: 'Error fetching brevet' });
      }
      res.status(200).json({ data: results });
    });
  },

 // controllers/brevetController.js
 getPiecesJointesByBrevetId: (req, res) => {
  const brevetId = req.params.id;

  Brevet.getByBrevetId(brevetId, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des pièces jointes:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des pièces jointes' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucune pièce jointe trouvée pour ce brevet' });
    }

    // Convertir les données des fichiers en base64
    const fichiers = results.map(result => ({
      id_piece_jointe: result.id_piece_jointe,
      id_brevet: result.id_brevet,
      nom_fichier: result.nom_fichier,
      type_fichier: result.type_fichier,
      donnees: result.donnees.toString('base64') // Convertir les données en base64
    }));

    res.status(200).json({ data: fichiers });
  });
},







  getByClientId: (req, res) => {
    const clientId = req.params.id; // Utilisez req.params.id pour obtenir l'id du client depuis l'URL
    Brevet.getByClientId(clientId, (err, results) => {
      if (err) {
        console.error("Error fetching brevet:", err);
        return res.status(500).json({ error: 'Error fetching brevet' });
      }
      res.status(200).json(results);
    });
  },

  updateBrevet: (req, res) => {
    const id = req.params.id;
    const brevetData = req.body;
    Brevet.update(id, brevetData, (err, results) => {
      if (err) {
        console.error("Error updating brevet:", err);
        return res.status(500).json({ error: 'Error updating brevet' });
      }
      res.status(200).json({ message: 'Brevet updated successfully', data: results });
    });
  },

  deleteBrevet: (req, res) => {
    const id = req.params.id;
    Brevet.delete(id, (err, results) => {
      if (err) {
        console.error("Error deleting brevet:", err);
        return res.status(500).json({ error: 'Error deleting brevet' });
      }
      res.status(200).json({ message: 'Brevet deleted successfully', data: results });
    });
  },
  

  
};

module.exports = brevetController;
