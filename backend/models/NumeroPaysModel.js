const db = require('../config/dbconfig');

const NumeroPays = {
  getByBrevetId: (brevetId, callback) => {
    const sql = `
      SELECT numero_pays.id_brevet, numero_pays.numero_depot, numero_pays.numero_publication, pays.nom_fr_fr, id_statuts, numero_pays.alpha2, numero_pays.date_depot, numero_pays.date_delivrance, numero_pays.numero_delivrance, numero_pays.licence
      FROM numero_pays
      JOIN pays ON numero_pays.id_pays = pays.id_pays
      WHERE numero_pays.id_brevet = ?
    `;
    db.query(sql, [brevetId], (err, results) => {
      if (err) {
        console.error('Error fetching data from numero_pays:', err);
        return callback(err, null);
      }
      callback(null, results);
    });
  }
};

module.exports = NumeroPays;
