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
  Deposant.belongsToMany(models.Brevet, { through: 'BrevetDeposants' });
  Deposant.belongsToMany(models.Pays, { through: 'DeposantPays' });
};

return Deposant;
};