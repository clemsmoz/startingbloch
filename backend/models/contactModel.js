const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

const Contact = sequelize.define('Contact', {
  // Définir les colonnes de la table contact_cabinet et contact_client
}, {
  tableName: 'contact',
  timestamps: false
});

module.exports = Contact;
