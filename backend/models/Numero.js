module.exports = (sequelize, DataTypes) => {


const NumeroPays = sequelize.define('NumeroPays', {
  // Définir les colonnes de la table numero_pays
}, {
  tableName: 'numero_pays',
  timestamps: false
});

return NumeroPays;
};