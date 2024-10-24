const db = require('../config/dbconfig');

class CabinetAnnuite {
  static getAll(callback) {
    const query = 'SELECT * FROM cabinet_annuite'; // Assurez-vous que le nom de la table est correct
    db.query(query, (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }
  static create(data, callback) {
    const query = 'INSERT INTO cabinet_annuite (nom_cabinet, reference_cabinet) VALUES (?, ?)';
    db.query(query, [data.nom_cabinet, data.reference_cabinet], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }
}

module.exports = CabinetAnnuite;
