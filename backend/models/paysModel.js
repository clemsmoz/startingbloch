const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

const Pays = sequelize.define('Pays', {
  // Définir les colonnes de la table pays
}, {
  tableName: 'pays',
  timestamps: false
});

module.exports = Pays;
