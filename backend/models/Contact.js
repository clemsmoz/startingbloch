module.exports = (sequelize, DataTypes) => {

const Contact = sequelize.define('Contact', {
  
  nom_contact: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  prenom_contact: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  poste_contact: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  cabinet_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'contacts',
  timestamps: false
});

// Associations pour emails, téléphones et rôles
Contact.associate = (models) => {
  Contact.hasMany(models.ContactEmail, { foreignKey: 'contact_id', as: 'emails', onDelete: 'CASCADE' });
  Contact.hasMany(models.ContactPhone, { foreignKey: 'contact_id', as: 'phones', onDelete: 'CASCADE' });
  Contact.hasMany(models.ContactRole, { foreignKey: 'contact_id', as: 'roles', onDelete: 'CASCADE' });
  Contact.belongsTo(models.Client, { foreignKey: 'client_id' });
  Contact.belongsTo(models.Cabinet, { foreignKey: 'cabinet_id' });
};

return Contact;
};
