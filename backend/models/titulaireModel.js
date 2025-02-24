const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

const Titulaire = sequelize.define('Titulaire', {
  nom_titulaire: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom_titulaire: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email_titulaire: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telephone_titulaire: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'titulaire',
  timestamps: false
});

module.exports = Titulaire;
