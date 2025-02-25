module.exports = (sequelize, DataTypes) => {
  const Brevet = sequelize.define('Brevet', {
    reference_famille: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    commentaire: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Brevets',
    timestamps: false
  });

  return Brevet;
};
