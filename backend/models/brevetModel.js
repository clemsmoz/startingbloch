const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

const Brevet = sequelize.define('Brevet', {
  reference_famille: {
    type: DataTypes.STRING,
    allowNull: false
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  commentaire: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'brevet',
  timestamps: false
});

module.exports = Brevet;
