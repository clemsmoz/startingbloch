// models/Pays.js
module.exports = (sequelize, DataTypes) => {
  const Pays = sequelize.define('Pays', {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code:      { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    alpha2:    { type: DataTypes.STRING,  allowNull: true, defaultValue: null },
    alpha3:    { type: DataTypes.STRING,  allowNull: true, defaultValue: null, unique: true },
    nom_en_gb: { type: DataTypes.STRING,  allowNull: true, defaultValue: null },
    nom_fr_fr: { type: DataTypes.STRING,  allowNull: true, defaultValue: null }
  }, {
    tableName: 'pays',
    timestamps: false
  });

  Pays.associate = (models) => {
    Pays.hasMany(models.NumeroPays, { foreignKey: 'id_pays' });
    ['Titulaire','Deposant','Inventeur','Cabinet'].forEach(m => {
      Pays.belongsToMany(models[m], {
        through: `${m}Pays`,
        uniqueKey: false
      });
    });
    Pays.belongsToMany(models.Statuts, { through: 'PaysStatuts', uniqueKey: false });
  };

  return Pays;
};
