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
    Pays.belongsToMany(models.Titulaire, { through: 'TitulairePays' });
    Pays.belongsToMany(models.Deposant, { through: 'DeposantPays' });
    Pays.belongsToMany(models.Inventeur, { through: 'InventeurPays' });
    Pays.belongsToMany(models.Statuts, { through: 'PaysStatuts' });
    Pays.belongsToMany(models.Cabinet, {
      through: 'CabinetPays',
      foreignKey: 'PaysId',
      otherKey: 'CabinetId'
    });
  };

  return Pays;
};
