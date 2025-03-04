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
      through: 'CabinetPays',       // utilisation de la table jointe "CabinetPays"
      foreignKey: 'CabinetId',       // colonne pour Cabinet
      otherKey: 'PaysId'             // colonne pour Pays
    });
    Cabinet.hasMany(models.Contact, { foreignKey: 'cabinet_id' });
  };

  return Cabinet;
};
