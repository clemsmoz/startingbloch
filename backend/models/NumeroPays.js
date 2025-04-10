module.exports = (sequelize, DataTypes) => {
  const NumeroPays = sequelize.define('NumeroPays', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_brevet: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false // Pas de contrainte d'unicité ici
    },
    id_pays: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    numero_depot: {
      type: DataTypes.STRING,
      allowNull: true
    },
    numero_publication: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_statuts: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date_depot: {
      type: DataTypes.DATE,
      allowNull: true
    },
    date_publication: {
      type: DataTypes.DATE,
      allowNull: true
    },
    date_delivrance: {
      type: DataTypes.DATE,
      allowNull: true
    },
    numero_delivrance: {
      type: DataTypes.STRING,
      allowNull: true
    },
    licence: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'numero_pays',
    timestamps: false,
    indexes: [
      // Créer un index composite mais pas unique
      {
        fields: ['id_brevet', 'id_pays'],
        name: 'brevet_pays_idx'
      }
    ]
  });

  NumeroPays.associate = (models) => {
    NumeroPays.belongsTo(models.Brevet, { foreignKey: 'id_brevet' });
    NumeroPays.belongsTo(models.Pays, { foreignKey: 'id_pays' });
    NumeroPays.belongsTo(models.Statuts, { foreignKey: 'id_statuts' });
  };

  return NumeroPays;
};