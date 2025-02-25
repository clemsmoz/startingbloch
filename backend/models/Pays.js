module.exports = (sequelize, DataTypes) => {


const Pays = sequelize.define('Pays', {
  // Définir les colonnes de la table pays
}, {
  tableName: 'pays',
  timestamps: false
});

return Pays;
};