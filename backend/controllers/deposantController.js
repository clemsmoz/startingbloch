const Deposant = require('../models/deposantModel');

const deposantController = {
createDeposant: (req, res) => {
  const newDeposant = new Deposant(req.body);
  Deposant.create(newDeposant, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(result);
    }
  });
},

getAllDeposants: (req, res) => {
  Deposant.getAll((err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(results);
    }
  });
},


getDeposantById: (req, res) => {
  const ids = req.query.id_deposants;

  if (!ids) {
    return res.status(400).send('Missing id_deposants query parameter');
  }

  const deposantIds = Array.isArray(ids) ? ids : ids.split(',');
  Deposant.getByIds(deposantIds, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send({ data: results });
  });
},

updateDeposant:(req, res) => {
  const updatedDeposant = new Deposant(req.body);
  Deposant.update(req.params.id, updatedDeposant, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }
  });
},

deleteDeposant: (req, res) => {
  Deposant.delete(req.params.id, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }
  });
},

}

module.exports = deposantController;