module.exports = (sequelize, DataTypes) => {

const Statuts = sequelize.define('Statuts', {
  
  statuts: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },}, {
  tableName: 'statuts',
  timestamps: false
});

Statuts.associate = (models) => {
  Statuts.hasMany(models.NumeroPays, { foreignKey: 'id_statuts' });
  Statuts.belongsToMany(models.Pays, { through: 'PaysStatuts', uniqueKey: false });
};

return Statuts;
};