const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

const NumeroPays = sequelize.define('NumeroPays', {
  // Définir les colonnes de la table numero_pays
}, {
  tableName: 'numero_pays',
  timestamps: false
});

module.exports = NumeroPays;
