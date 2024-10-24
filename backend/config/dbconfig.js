const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'clems',
  password: 'clems',
  database: 'mydb',
  port: 3306
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  } else {
    console.log('Connected to the MySQL database');
  }
});

module.exports = db;
