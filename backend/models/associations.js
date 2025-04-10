module.exports = (sequelize, DataTypes) => {
  // Définition manuelle des tables de jointure pour éviter les contraintes d'unicité par défaut
  
  // Table de jointure pour Brevet-Client
  const BrevetClients = sequelize.define('BrevetClients', {
    BrevetId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'brevet',
        key: 'id'
      }
    },
    ClientId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'client',
        key: 'id'
      }
    }
  }, {
    tableName: 'BrevetClients',
    timestamps: true,
    indexes: [
      {
        unique: false, // Explicitement désactiver l'unicité
        fields: ['BrevetId', 'ClientId']
      }
    ]
  });
  
  // Table de jointure pour Inventeurs-Pays sans contrainte d'unicité
  const InventeurPays = sequelize.define('InventeurPays', {
    InventeurId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'inventeurs',
        key: 'id'
      }
    },
    PaysId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pays',
        key: 'id'
      }
    },
    licence: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'InventeurPays',
    timestamps: true,
    indexes: [
      {
        unique: false, // Important: Désactiver l'unicité pour permettre plusieurs pays
        fields: ['InventeurId', 'PaysId']
      }
    ]
  });
  
  // Table de jointure pour Titulaires-Pays sans contrainte d'unicité
  const TitulairePays = sequelize.define('TitulairePays', {
    TitulaireId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'titulaire',
        key: 'id'
      }
    },
    PaysId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pays',
        key: 'id'
      }
    },
    licence: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'TitulairePays',
    timestamps: true,
    indexes: [
      {
        unique: false, // Important: Désactiver l'unicité pour permettre plusieurs pays
        fields: ['TitulaireId', 'PaysId']
      }
    ]
  });
  
  // Table de jointure pour Déposants-Pays sans contrainte d'unicité
  const DeposantPays = sequelize.define('DeposantPays', {
    DeposantId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'deposants',
        key: 'id'
      }
    },
    PaysId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pays',
        key: 'id'
      }
    },
    licence: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'DeposantPays',
    timestamps: true,
    indexes: [
      {
        unique: false, // Important: Désactiver l'unicité pour permettre plusieurs pays
        fields: ['DeposantId', 'PaysId']
      }
    ]
  });

  // Table de jointure pour Cabinet-Pays
  const CabinetPays = sequelize.define('CabinetPays', {
    CabinetId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'cabinet',
        key: 'id'
      }
    },
    PaysId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'pays',
        key: 'id'
      }
    }
  }, {
    tableName: 'CabinetPays',
    timestamps: true,
    indexes: [
      {
        unique: false, // Désactiver la contrainte d'unicité
        fields: ['CabinetId', 'PaysId']
      }
    ]
  });
  
  // Table de jointure pour Brevet-Cabinet avec des champs supplémentaires
  const BrevetCabinets = sequelize.define('BrevetCabinets', {
    BrevetId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'brevet',
        key: 'id'
      }
    },
    CabinetId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'cabinet',
        key: 'id'
      }
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dernier_intervenant: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    contact_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'BrevetCabinets',
    timestamps: true,
    indexes: [
      {
        unique: false, // Désactiver la contrainte d'unicité sur le type
        fields: ['BrevetId', 'CabinetId', 'type'] // Permet plusieurs cabinets par brevet selon le type
      }
    ]
  });
  
  // Table de jointure pour Brevet-Inventeurs
  const BrevetInventeurs = sequelize.define('BrevetInventeurs', {
    BrevetId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'brevet',
        key: 'id'
      }
    },
    InventeurId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'inventeurs',
        key: 'id'
      }
    }
  }, {
    tableName: 'BrevetInventeurs',
    timestamps: true,
    indexes: [
      {
        unique: false, // Désactiver l'unicité explicitement
        fields: ['BrevetId', 'InventeurId']
      }
    ]
  });
  
  // Ajout des autres tables de jointure avec unicité désactivée
  const BrevetTitulaires = sequelize.define('BrevetTitulaires', {
    BrevetId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'brevet',
        key: 'id'
      }
    },
    TitulaireId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'titulaire',
        key: 'id'
      }
    }
  }, {
    tableName: 'BrevetTitulaires',
    timestamps: true,
    indexes: [
      {
        unique: false,
        fields: ['BrevetId', 'TitulaireId']
      }
    ]
  });
  
  const BrevetDeposants = sequelize.define('BrevetDeposants', {
    BrevetId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'brevet',
        key: 'id'
      }
    },
    DeposantId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'deposants',
        key: 'id'
      }
    }
  }, {
    tableName: 'BrevetDeposants',
    timestamps: true,
    indexes: [
      {
        unique: false,
        fields: ['BrevetId', 'DeposantId']
      }
    ]
  });
  
  return {
    BrevetClients,
    InventeurPays,
    TitulairePays,
    DeposantPays,
    CabinetPays,
    BrevetCabinets,
    BrevetInventeurs,
    BrevetTitulaires,
    BrevetDeposants
  };
};
