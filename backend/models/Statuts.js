module.exports = (sequelize, DataTypes) => {

const Statuts = sequelize.define('Statuts', {
  
  statuts: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },}, {
  tableName: 'statuts',
  timestamps: false
});

return Statuts;
};