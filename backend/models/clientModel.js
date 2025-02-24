const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

const Client = sequelize.define('Client', {
  nom_client: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reference_client: {
    type: DataTypes.STRING,
    allowNull: false
  },
  adresse_client: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code_postal: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pays_client: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email_client: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telephone_client: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'client',
  timestamps: false
});

module.exports = Client;
