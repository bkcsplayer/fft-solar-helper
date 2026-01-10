const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  contact_person: {
    type: DataTypes.STRING(100)
  },
  phone: {
    type: DataTypes.STRING(50)
  },
  email: {
    type: DataTypes.STRING(100)
  },
  rate_per_watt: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  rate_per_panel: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  price_model: {
    type: DataTypes.STRING(20),
    defaultValue: 'per_watt',
    validate: {
      isIn: [['per_watt', 'per_panel']]
    }
  },
  address: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'clients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Client;
