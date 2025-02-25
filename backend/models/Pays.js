module.exports = (sequelize, DataTypes) => {

const Pays = sequelize.define('Pays', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.INTEGER(3),
    allowNull: false,
  },
  alpha2: {
    type: DataTypes.STRING(2),
    allowNull: false,
  },
  alpha3: {
    type: DataTypes.STRING(3),
    allowNull: false,
    unique: true
  },
  nom_en_gb: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  nom_fr_fr: {
    type: DataTypes.STRING(45),
    allowNull: false
  }
}, {
  tableName: 'pays',
  timestamps: false
});

return Pays;
};