const db = require('../config/dbconfig');

const Statuts = {
  getAllStatuts: (callback) => {
    const sql = 'SELECT * FROM statuts';
    db.query(sql, (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  }
};

module.exports = Statuts;
