// Nouveau modèle pour stocker plusieurs rôles par contact

module.exports = (sequelize, DataTypes) => {
  const ContactRole = sequelize.define('ContactRole', {
    contact_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'contacts', key: 'id' }
    },
    role: {
      type: DataTypes.ENUM(
        'Responsable PI',
        'Responsable juridique',
        'Responsable administratif',
        'Responsable technique',
        'Correspondant annuités',
        'Correspondant brevets',
        'Correspondant facturation',
        'Correspondant général',
        'Autre'
      ),
      allowNull: false
    }
  }, {
    tableName: 'contact_roles',
    timestamps: false
  });

  ContactRole.associate = (models) => {
    ContactRole.belongsTo(models.Contact, { foreignKey: 'contact_id', as: 'contact' });
  };

  return ContactRole;
};
