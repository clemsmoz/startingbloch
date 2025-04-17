module.exports = (sequelize, DataTypes) => {
  const Titulaire = sequelize.define('Titulaire', {
    nom_titulaire: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    prenom_titulaire: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    email_titulaire: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    telephone_titulaire: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'titulaire',
    timestamps: false
  });

  Titulaire.associate = (models) => {
    Titulaire.belongsToMany(models.Brevet, { 
      through: 'BrevetTitulaires',
      foreignKey: 'TitulaireId',
      otherKey: 'BrevetId',
      uniqueKey: false // Désactiver la contrainte d'unicité
    });
    
    // Relation avec les pays - explicitement désactiver l'unicité
    Titulaire.belongsToMany(models.Pays, { 
      through: 'TitulairePays',
      foreignKey: 'TitulaireId',
      otherKey: 'PaysId',
      unique: false, // Désactiver l'unicité (nouvelle façon)
      uniqueKey: false // Ancienne façon de désactiver l'unicité
    });
  };

  return Titulaire;
};
