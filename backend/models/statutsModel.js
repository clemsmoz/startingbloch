const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

const Statuts = sequelize.define('Statuts', {
  // Définir les colonnes de la table statuts
}, {
  tableName: 'statuts',
  timestamps: false
});

module.exports = Statuts;
