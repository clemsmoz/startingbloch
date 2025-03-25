module.exports = (sequelize, DataTypes) => {
  const Brevet = sequelize.define('Brevet', {
    reference_famille: {
      type: DataTypes.STRING,
      allowNull: false  // Changement ici pour rendre le champ obligatoire
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false  // Changement ici pour rendre le champ obligatoire
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
    Brevet.belongsToMany(models.Client, { 
      through: 'BrevetClients',
      foreignKey: 'BrevetId'
    });
    Brevet.belongsToMany(models.Titulaire, { 
      through: 'BrevetTitulaires',
      foreignKey: 'BrevetId'
    });
    Brevet.belongsToMany(models.Deposant, { 
      through: 'BrevetDeposants',
      foreignKey: 'BrevetId'
    });
    Brevet.belongsToMany(models.Inventeur, { 
      through: 'BrevetInventeurs',
      foreignKey: 'BrevetId'
    });
    Brevet.belongsToMany(models.Cabinet, { 
      through: 'BrevetCabinets',
      foreignKey: 'BrevetId'
    });
    Brevet.hasMany(models.NumeroPays, { foreignKey: 'id_brevet' });
  };

  return Brevet;
};
