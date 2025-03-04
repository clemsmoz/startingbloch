// const { Sequelize } = require('sequelize');
// const path = require('path');

// const databasePath = process.env.NODE_ENV === 'production'
//   ? path.join(process.resourcesPath, 'database.db')
//   : path.join(__dirname, 'database.db');

// console.log("📂 Chemin SQLite :", databasePath);

// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: databasePath,
//   logging: console.log
// });

// // Vérification de la connexion (optionnel)
// sequelize.authenticate()
//   .then(() => console.log('✅ Connexion réussie à la base de données avec Sequelize'))
//   .catch(err => console.error('❌ Erreur de connexion à SQLite avec Sequelize :', err));

// module.exports = sequelize;
const { Sequelize } = require('sequelize');
const path = require('path');

const databasePath = process.env.NODE_ENV === 'production'
  ? path.join(process.resourcesPath, 'database.sqlite')
  : path.join(__dirname, 'database.sqlite');

console.log("📂 Chemin SQLite :", databasePath);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath,
  logging: console.log
});

// Vérification de la connexion (optionnel)
sequelize.authenticate()
  .then(() => console.log('✅ Connexion réussie à la base de données avec Sequelize'))
  .catch(err => console.error('❌ Erreur de connexion à SQLite avec Sequelize :', err));

module.exports = sequelize;
