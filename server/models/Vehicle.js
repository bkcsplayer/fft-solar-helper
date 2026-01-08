const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  plate_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  model: {
    type: DataTypes.STRING(100)
  },
  current_mileage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  vehicle_documents: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('vehicle_documents');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('vehicle_documents', JSON.stringify(value));
    }
  },
  notes: {
    type: DataTypes.TEXT
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'vehicles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Vehicle;
