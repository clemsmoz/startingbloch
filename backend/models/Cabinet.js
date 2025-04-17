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
    Cabinet.belongsToMany(models.Brevet, { 
      through: {
        model: 'BrevetCabinets',
        unique: false // Désactiver la contrainte d'unicité
      },
      foreignKey: 'CabinetId',
      otherKey: 'BrevetId'
    });
    
    Cabinet.hasMany(models.Contact, { foreignKey: 'cabinet_id' });
    
    // Correction de l'association avec les pays
    Cabinet.belongsToMany(models.Pays, {
      through: 'CabinetPays',
      foreignKey: 'CabinetId',
      otherKey: 'PaysId',
      unique: false,
      uniqueKey: false,
      timestamps: true
    });
  };

  return Cabinet;
};
