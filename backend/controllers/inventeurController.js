const Inventeur = require('../models/inventeurModel');

const inventeurController = { 
createInventeur: (req, res) => {
  const newInventeur = new Inventeur(req.body);
  Inventeur.create(newInventeur, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(result);
    }
  });
}, 

getAllInventeurs: (req, res) => {
  Inventeur.getAll((err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(results);
    }
  });
},



updateInventeur: (req, res) => {
  const updatedInventeur = new Inventeur(req.body);
  Inventeur.update(req.params.id, updatedInventeur, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }
  });
},

deleteInventeur: (req, res) => {
  Inventeur.delete(req.params.id, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }
  });
},

getInventeurById: (req, res) => {
  // Vérifier si `req.query.id_inventeurs` est un tableau
  let idInventeurs = req.query.id_inventeurs;

  if (!Array.isArray(idInventeurs)) {
    // Si c'est un seul identifiant, le transformer en tableau
    idInventeurs = [idInventeurs];
  }

  // Vérifier si le tableau est non vide
  if (!idInventeurs.length) {
    return res.status(400).json({ error: 'No inventeurs IDs provided' });
  }

  // Convertir les identifiants en entiers
  idInventeurs = idInventeurs.map(id => parseInt(id, 10));

  // Récupérer les inventeurs en fonction des identifiants
  Inventeur.getByIds(idInventeurs, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching inventeurs' });
    }
    return res.status(200).json({ data: results });
  });
},




}



module.exports = inventeurController;
