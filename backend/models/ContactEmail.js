// Nouveau modèle pour stocker plusieurs emails par contact

module.exports = (sequelize, DataTypes) => {
  const ContactEmail = sequelize.define('ContactEmail', {
    contact_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'contacts', key: 'id' }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'contact_emails',
    timestamps: false
  });

  ContactEmail.associate = (models) => {
    ContactEmail.belongsTo(models.Contact, { foreignKey: 'contact_id', as: 'contact' });
  };

  return ContactEmail;
};
