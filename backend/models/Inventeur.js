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
    Inventeur.belongsToMany(models.Brevet, { 
      through: 'BrevetInventeurs',
      foreignKey: 'InventeurId',
      otherKey: 'BrevetId',
      uniqueKey: false // Désactiver la contrainte d'unicité
    });
    
    // Relation avec les pays - explicitement désactiver l'unicité
    Inventeur.belongsToMany(models.Pays, { 
      through: 'InventeurPays',
      foreignKey: 'InventeurId',
      otherKey: 'PaysId',
      unique: false, // Désactiver l'unicité (nouvelle façon)
      uniqueKey: false // Ancienne façon de désactiver l'unicité
    });
  };

  return Inventeur;
};
