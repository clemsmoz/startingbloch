module.exports = (sequelize, DataTypes) => {

const Pays = sequelize.define('Pays', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  alpha2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  alpha3: {
    type: DataTypes.STRING,
    allowNull: false,
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

return Pays;
};