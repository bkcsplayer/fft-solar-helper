const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  client_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  customer_name: {
    type: DataTypes.STRING(100)
  },
  customer_phone: {
    type: DataTypes.STRING(50)
  },
  panel_brand: {
    type: DataTypes.STRING(100)
  },
  panel_watt: {
    type: DataTypes.INTEGER
  },
  panel_quantity: {
    type: DataTypes.INTEGER
  },
  total_watt: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.panel_watt * this.panel_quantity;
    }
  },
  project_files: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('project_files');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('project_files', JSON.stringify(value));
    }
  },
  siteplan_file: {
    type: DataTypes.STRING(500)
  },
  bom_file: {
    type: DataTypes.STRING(500)
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'in_progress', 'completed']]
    }
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'projects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Project;
