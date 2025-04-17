module.exports = (sequelize, DataTypes) => {
  const NumeroPays = sequelize.define('NumeroPays', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_brevet: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_pays: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    numero_depot: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    numero_publication: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    id_statuts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    date_depot: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    date_publication: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    date_delivrance: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    numero_delivrance: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    licence: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'numero_pays',
    timestamps: false,
    indexes: [
      {
        fields: ['id_brevet', 'id_pays'],
        unique: false
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