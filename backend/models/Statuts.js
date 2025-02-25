module.exports = (sequelize, DataTypes) => {

const Statuts = sequelize.define('Statuts', {
  // Définir les colonnes de la table statuts
}, {
  tableName: 'statuts',
  timestamps: false
});

return Statuts;
};