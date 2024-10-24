const db = require('../config/dbconfig');

const Pays = {
  getAll: (callback) => {
    const sql = 'SELECT * FROM pays';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching pays:', err);
        return callback(err, null);
      }
      callback(null, results);
    });
  },
};

module.exports = Pays;
