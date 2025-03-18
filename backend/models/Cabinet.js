// models/Cabinet.js
module.exports = (sequelize, DataTypes) => {
  const Cabinet = sequelize.define('Cabinet', {
    nom_cabinet: { type: DataTypes.STRING, allowNull: true },
    email_cabinet: { type: DataTypes.STRING, allowNull: true },
    telephone_cabinet: { type: DataTypes.STRING, allowNull: true },
    reference_cabinet: { type: DataTypes.STRING, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'cabinet',
    timestamps: false
  });

  Cabinet.associate = (models) => {
    Cabinet.belongsToMany(models.Brevet, { through: 'BrevetCabinets' });
    Cabinet.belongsToMany(models.Pays, { 
      through: {
        model: 'CabinetPays',
        unique: false
      },
      foreignKey: {
        name: 'CabinetId',
        unique: false
      },
      otherKey: {
        name: 'PaysId',
        unique: false
      }
    });
    Cabinet.hasMany(models.Contact, { foreignKey: 'cabinet_id' });
  };

  return Cabinet;
};
