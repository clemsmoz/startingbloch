// models/user.model.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    nom_user: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    prenom_user: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    email_user: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      unique: true,
      validate: { isEmail: true },
    },
    password_user: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user', // 'admin' ou 'user'
    },
    canWrite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    canRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    timestamps: true, // gère createdAt et updatedAt automatiquement
  });

  return User;
};