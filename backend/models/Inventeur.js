module.exports = (sequelize, DataTypes) => {

  const Inventeur = sequelize.define('Inventeur', {
    nom_inventeur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prenom_inventeur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_inventeur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telephone_inventeur: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'inventeurs',
    timestamps: false
  });

  Inventeur.associate = (models) => {
    Inventeur.belongsToMany(models.Brevet, { through: 'BrevetInventeurs' });
    Inventeur.belongsToMany(models.Pays, { through: 'InventeurPays' });
  };

  return Inventeur;
};