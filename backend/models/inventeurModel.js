const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

const Inventeur = sequelize.define('Inventeur', {
  nom_inventeur: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom_inventeur: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email_inventeur: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telephone_inventeur: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'inventeurs',
  timestamps: false
});

module.exports = Inventeur;
