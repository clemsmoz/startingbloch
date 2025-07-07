// Nouveau modèle pour stocker plusieurs téléphones par contact

module.exports = (sequelize, DataTypes) => {
  const ContactPhone = sequelize.define('ContactPhone', {
    contact_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'contacts', key: 'id' }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'contact_phones',
    timestamps: false
  });

  ContactPhone.associate = (models) => {
    ContactPhone.belongsTo(models.Contact, { foreignKey: 'contact_id', as: 'contact' });
  };

  return ContactPhone;
};
