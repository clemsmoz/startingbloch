module.exports = (sequelize, DataTypes) => {
  const Titulaire = sequelize.define('Titulaire', {
    nom_titulaire: {
      type: DataTypes.STRING,
      allowNull: true
    },
    prenom_titulaire: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email_titulaire: {
      type: DataTypes.STRING,
      allowNull: true
    },
    telephone_titulaire: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'titulaire',
    timestamps: false
  });

  Titulaire.associate = (models) => {
    Titulaire.belongsToMany(models.Brevet, { through: 'BrevetTitulaires' });
    // La table pivot TitulairePays doit inclure le champ "licence".
    Titulaire.belongsToMany(models.Pays, { through: 'TitulairePays' });
  };

  return Titulaire;
};
