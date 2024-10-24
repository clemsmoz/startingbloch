const Statut = require('../models/statutsModel');

const statutsController = {
getAllStatuts: (req, res) => {
  Statut.getAllStatuts((err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send({ data: result });
  });
},

}

module.exports =  statutsController;