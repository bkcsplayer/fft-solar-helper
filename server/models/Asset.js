const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  asset_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'available',
    validate: {
      isIn: [['available', 'in_use', 'maintenance']]
    }
  },
  current_holder_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'staff',
      key: 'id'
    }
  },
  purchase_date: {
    type: DataTypes.DATEONLY
  },
  purchase_cost: {
    type: DataTypes.DECIMAL(10, 2)
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'assets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Asset;
