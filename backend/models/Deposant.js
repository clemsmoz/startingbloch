module.exports = (sequelize, DataTypes) => {
  const Deposant = sequelize.define('Deposant', {
    nom_deposant: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prenom_deposant: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_deposant: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telephone_deposant: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'deposants',
    timestamps: false
  });

  Deposant.associate = (models) => {
    Deposant.belongsToMany(models.Brevet, { 
      through: 'BrevetDeposants',
      foreignKey: 'DeposantId',
      otherKey: 'BrevetId',
      unique: false,
      uniqueKey: false
    });
    
    Deposant.belongsToMany(models.Pays, { 
      through: 'DeposantPays',
      foreignKey: 'DeposantId',
      otherKey: 'PaysId',
      unique: false,
      uniqueKey: false
    });
  };

  return Deposant;
};
