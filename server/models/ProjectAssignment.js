const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectAssignment = sequelize.define('ProjectAssignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'staff',
      key: 'id'
    }
  },
  role_in_project: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['leader', 'installer', 'electrician']]
    }
  },
  phase: {
    type: DataTypes.STRING(20),
    defaultValue: 'standard',
    validate: {
      isIn: [['standard', 'removal', 'installation']]
    }
  },
  calculated_pay: {
    type: DataTypes.DECIMAL(10, 2)
  },
  paid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  payment_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  last_payment_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_notified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'project_assignments',
  timestamps: true,
  createdAt: 'assigned_at',
  updatedAt: false
});

module.exports = ProjectAssignment;
