module.exports = (sequelize, DataTypes) => {

const Contact = sequelize.define('Contact', {
  
  nom_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  prenom_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telephone_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  poste_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'client',
      key: 'id'
    }
  },
  cabinet_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cabinet',
      key: 'id'
    }
  }
}, {
  tableName: 'contact',
  timestamps: false
  // La validation d'exclusivité a été supprimée ici
});

Contact.associate = (models) => {
  Contact.belongsTo(models.Client, { foreignKey: 'client_id' });
  Contact.belongsTo(models.Cabinet, { foreignKey: 'cabinet_id' });
};

return Contact;
};
