const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

const Cabinet = sequelize.define('Cabinet', {
  nom_cabinet: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email_cabinet: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telephone_cabinet: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reference_cabinet: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'cabinet',
  timestamps: false
});

module.exports = Cabinet;
