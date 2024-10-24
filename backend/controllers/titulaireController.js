const Titulaire = require('../models/titulaireModel');


const titulaireContoller =  {

createTitulaire: (req, res) => {
  const newTitulaire = new Titulaire(req.body);
  Titulaire.create(newTitulaire, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(result);
    }
  });
}, 
getAllTitulaires : (req, res) => {
  Titulaire.getAll((err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(results);
    }
  });
},

getTitulaireById: (req, res) => {
  const ids = req.query.id_titulaires;

  if (!ids) {
    return res.status(400).send('Missing id_titulaires query parameter');
  }

  const titulaireIds = Array.isArray(ids) ? ids : ids.split(',');
  Titulaire.getByIds(titulaireIds, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send({ data: results });
  });
},

updateTitulaire :(req, res) => {
  const updatedTitulaire = new Titulaire(req.body);
  Titulaire.update(req.params.id, updatedTitulaire, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }
  });
},

deleteTitulaire:(req, res) => {
  Titulaire.delete(req.params.id, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }
  });
}

};

module.exports = titulaireContoller;