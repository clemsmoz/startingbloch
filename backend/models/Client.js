module.exports = (sequelize, DataTypes) => {

const Client = sequelize.define('Client', {
  
  nom_client: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reference_client: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  adresse_client: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  code_postal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pays_client: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email_client: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telephone_client: {
    type: DataTypes.STRING,
    allowNull: true,
  }
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
