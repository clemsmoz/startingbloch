const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Détermine si l'application est en production (packagée) ou en développement
const databasePath = process.env.NODE_ENV === 'production'
  ? path.join(process.resourcesPath, 'database.sqlite')  // En production, le fichier est placé dans process.resourcesPath
  : path.join(__dirname, 'database.sqlite');              // En développement, le fichier est dans le même dossier

console.log("📂 Chemin SQLite :", databasePath);

// Création de l'instance Sequelize pour SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath,
  logging: console.log  // Affiche les requêtes SQL (optionnel)
});

// Vérification de la connexion
sequelize.authenticate()
  .then(() => console.log('✅ Connexion réussie à la base de données avec Sequelize'))
  .catch((err) => console.error('❌ Erreur de connexion à SQLite avec Sequelize :', err));

// Synchronisation de la base de données (création des tables si elles n'existent pas)
sequelize.sync()
  .then(() => console.log('✅ Les tables ont été créées ou existent déjà.'))
  .catch((error) => console.error('❌ Erreur lors de la synchronisation des tables :', error));

module.exports = sequelize;
