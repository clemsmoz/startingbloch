const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../db'); // Importation de l'instance Sequelize depuis db.js
const db = {};

fs.readdirSync(__dirname)
  .filter((file) => {
    console.log(`Fichier détecté : ${file}`);
    return file.endsWith('.js') && file !== 'index.js';
  })
  .forEach((file) => {
    console.log(`Chargement du modèle : ${file}`);
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    console.log(`Modèle chargé : ${model.name}`);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

const Brevet = require('./Brevet');
db.Sequelize = Sequelize; // Ajoute la classe Sequelize

module.exports = db;
