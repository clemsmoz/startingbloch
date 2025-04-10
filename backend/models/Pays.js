// models/Pays.js
module.exports = (sequelize, DataTypes) => {
  const Pays = sequelize.define('Pays', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.INTEGER, allowNull: true },
    alpha2: { type: DataTypes.STRING, allowNull: true },
    alpha3: { type: DataTypes.STRING, allowNull: true, unique: true },
    nom_en_gb: { type: DataTypes.STRING, allowNull: true },
    nom_fr_fr: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'pays',
    timestamps: false
  });

  Pays.associate = (models) => {
    Pays.hasMany(models.NumeroPays, { foreignKey: 'id_pays' });
    
    // Correction des associations avec les clés étrangères correctes et sans unicité
    Pays.belongsToMany(models.Titulaire, { 
      through: 'TitulairePays',
      foreignKey: 'PaysId',
      otherKey: 'TitulaireId',
      unique: false,
      uniqueKey: false
    });
    
    Pays.belongsToMany(models.Deposant, { 
      through: 'DeposantPays',
      foreignKey: 'PaysId',
      otherKey: 'DeposantId',
      unique: false,
      uniqueKey: false
    });
    
    Pays.belongsToMany(models.Inventeur, { 
      through: 'InventeurPays',
      foreignKey: 'PaysId',
      otherKey: 'InventeurId',
      unique: false,
      uniqueKey: false
    });
    
    Pays.belongsToMany(models.Statuts, { through: 'PaysStatuts' });
    
    Pays.belongsToMany(models.Cabinet, {
      through: 'CabinetPays',
      foreignKey: 'PaysId',
      otherKey: 'CabinetId',
      uniqueKey: false
    });
  };

  return Pays;
};
