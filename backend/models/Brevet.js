module.exports = (sequelize, DataTypes) => {
  const Brevet = sequelize.define('Brevet', {
    reference_famille: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    commentaire: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pieces_jointes: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'brevet',
    timestamps: false
  });

  Brevet.associate = (models) => {
    Brevet.belongsToMany(models.Client, { through: 'BrevetClients' });
    Brevet.belongsToMany(models.Titulaire, { through: 'BrevetTitulaires' });
    Brevet.belongsToMany(models.Deposant, { through: 'BrevetDeposants' });
    Brevet.belongsToMany(models.Inventeur, { through: 'BrevetInventeurs' });
    Brevet.belongsToMany(models.Cabinet, { through: 'BrevetCabinets' });
    Brevet.hasMany(models.NumeroPays, { foreignKey: 'id_brevet' });
  };

  // Remarque : Assurez-vous de synchroniser ce modèle avec la base (ex. via migration ou sequelize.sync({ alter: true }))
  return Brevet;
};
