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
      through: 'CabinetPays', // La table jointe
      foreignKey: { 
        name: 'CabinetId', 
        allowNull: false,
        unique: false  // Empêche l'ajout d'une contrainte unique sur cette colonne
      },
      otherKey: { 
        name: 'PaysId', 
        allowNull: false,
        unique: false  // Pareil pour l'autre clé
      }
    });
    Cabinet.hasMany(models.Contact, { foreignKey: 'cabinet_id' });
  };

  return Cabinet;
};
