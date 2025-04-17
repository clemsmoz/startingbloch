module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    nom_client:       { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    reference_client: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    adresse_client:   { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    code_postal:      { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    pays_client:      { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    email_client:     { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    telephone_client: { type: DataTypes.STRING, allowNull: true, defaultValue: null }
  }, {
    tableName: 'client',
    timestamps: false
  });

  Client.associate = (models) => {
    Client.belongsToMany(models.Brevet, { through: 'BrevetClients' });
    Client.hasMany(models.Contact, { foreignKey: 'client_id' });
  };

  return Client;
};
