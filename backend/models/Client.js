module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    nom_client:       { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    reference_client: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    adresse_client:   { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    code_postal:      { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    pays_client:      { type: DataTypes.STRING, allowNull: true, defaultValue: null },

    email_client:     { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    telephone_client: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    canWrite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    canRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'client',
    timestamps: false
  });

  // Correction : Ajoute la déclaration d'association seulement si models existe
  Client.associate = (models) => {
    if (!models) return;
    if (models.Brevet) {
      Client.belongsToMany(models.Brevet, { through: 'BrevetClients' });
    }
    if (models.Contact) {
      Client.hasMany(models.Contact, { foreignKey: 'client_id' });
    }
  };

  return Client;
};
