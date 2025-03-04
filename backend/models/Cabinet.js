module.exports = (sequelize, DataTypes) => {
  const Cabinet = sequelize.define('Cabinet', {
    nom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    adresse: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference_cabinet: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    }
    // Supprimez l'attribut "pays" ici
  }, {
    tableName: 'cabinet',
    timestamps: false
  });

  Cabinet.associate = (models) => {
    Cabinet.belongsToMany(models.Brevet, { through: 'BrevetCabinets' });
    Cabinet.belongsToMany(models.Pays, { through: 'CabinetPays', foreignKey: 'CabinetId', otherKey: 'PaysId' });
    Cabinet.hasMany(models.Contact, { foreignKey: 'cabinet_id' });
  };

  return Cabinet;
};
