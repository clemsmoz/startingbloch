module.exports = (sequelize, DataTypes) => {
  const Brevet = sequelize.define('Brevet', {
    reference_famille: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'brevet',
    timestamps: false
  });

  Brevet.associate = (models) => {
    // Toutes les associations many-to-many avec unicité désactivée
    Brevet.belongsToMany(models.Client, { 
      through: 'BrevetClients',
      foreignKey: 'BrevetId',
      otherKey: 'ClientId',
      unique: false // Désactiver l'unicité
    });
    
    Brevet.belongsToMany(models.Titulaire, { 
      through: 'BrevetTitulaires',
      foreignKey: 'BrevetId',
      otherKey: 'TitulaireId',
      unique: false // Désactiver l'unicité
    });
    
    Brevet.belongsToMany(models.Deposant, { 
      through: 'BrevetDeposants',
      foreignKey: 'BrevetId',
      otherKey: 'DeposantId',
      unique: false // Désactiver l'unicité
    });
    
    Brevet.belongsToMany(models.Inventeur, { 
      through: 'BrevetInventeurs',
      foreignKey: 'BrevetId',
      otherKey: 'InventeurId',
      unique: false // Désactiver l'unicité
    });
    
    Brevet.belongsToMany(models.Cabinet, { 
      through: 'BrevetCabinets',
      foreignKey: 'BrevetId',
      otherKey: 'CabinetId',
      unique: false // Désactiver l'unicité explicitement
    });
    
    // Modifier cette relation pour permettre plusieurs pays par brevet
    Brevet.hasMany(models.NumeroPays, { 
      foreignKey: 'id_brevet',
      constraints: false // Désactiver la contrainte d'unicité
    });
  };

  return Brevet;
};
