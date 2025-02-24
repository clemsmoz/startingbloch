const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

const Deposant = sequelize.define('Deposant', {
  nom_deposant: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom_deposant: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email_deposant: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telephone_deposant: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'deposants',
  timestamps: false
});

module.exports = Deposant;
