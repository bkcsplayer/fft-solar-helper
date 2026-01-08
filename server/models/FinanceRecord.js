const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinanceRecord = sequelize.define('FinanceRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  record_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  record_type: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['income', 'expense']]
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  project_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  staff_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'staff',
      key: 'id'
    }
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'vehicles',
      key: 'id'
    }
  },
  recurring_expense_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'recurring_expenses',
      key: 'id'
    }
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if this record was auto-generated from recurring expense'
  },
  notes: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'finance_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = FinanceRecord;
