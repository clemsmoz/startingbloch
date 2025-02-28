module.exports = (sequelize, DataTypes) => {

  const Titulaire = sequelize.define('Titulaire', {
    nom_titulaire: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prenom_titulaire: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email_titulaire: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telephone_titulaire: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'titulaire',
    timestamps: false
  });

  Titulaire.associate = (models) => {
    Titulaire.belongsToMany(models.Brevet, { through: 'BrevetTitulaires' });
    Titulaire.belongsToMany(models.Pays, { through: 'TitulairePays' });
  };

  return Titulaire;

};