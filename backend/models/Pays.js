module.exports = (sequelize, DataTypes) => {

const Pays = sequelize.define('Pays', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  alpha2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  alpha3: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nom_en_gb: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nom_fr_fr: {
    type: DataTypes.STRING,
    allowNull: false
  }
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
};

return Pays;
};