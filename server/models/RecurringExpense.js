const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RecurringExpense = sequelize.define('RecurringExpense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'software, car_loan, insurance, etc.'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  frequency: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'monthly',
    validate: {
      isIn: [['monthly', 'yearly', 'weekly']]
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Null means no end date'
  },
  last_processed_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Last date this recurring expense was processed'
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
  tableName: 'recurring_expenses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = RecurringExpense;
