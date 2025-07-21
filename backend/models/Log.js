// Modèle Sequelize pour les logs d'activité

module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define('Log', {
    user: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'logs',
    timestamps: false
  });

  return Log;
};
