// models/user.model.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
  
    nom_user: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prenom_user: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_user: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: { isEmail: true },
    },
    password_user: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    tableName: 'users',
    timestamps: true, // gère createdAt et updatedAt automatiquement
  });

  return User;
};