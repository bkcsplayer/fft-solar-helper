const { sequelize } = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Staff = require('./Staff');
const Project = require('./Project');
const ProjectInverter = require('./ProjectInverter');
const ProjectAssignment = require('./ProjectAssignment');
const ProjectProgress = require('./ProjectProgress');
const ProjectFile = require('./ProjectFile');
const Vehicle = require('./Vehicle');
const VehicleUsage = require('./VehicleUsage');
const VehicleMaintenance = require('./VehicleMaintenance');
const VehicleMaintenanceLog = require('./VehicleMaintenanceLog');
const Asset = require('./Asset');
const FinanceRecord = require('./FinanceRecord');
const RecurringExpense = require('./RecurringExpense');
const SystemSetting = require('./SystemSetting');
const SystemSettings = require('./SystemSettings');

// Define Relationships

// Client -> Projects
Client.hasMany(Project, { foreignKey: 'client_id', as: 'projects' });
Project.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Project -> Inverters
Project.hasMany(ProjectInverter, { foreignKey: 'project_id', as: 'inverters', onDelete: 'CASCADE' });
ProjectInverter.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Project -> Assignments
Project.hasMany(ProjectAssignment, { foreignKey: 'project_id', as: 'assignments', onDelete: 'CASCADE' });
ProjectAssignment.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Staff -> Assignments
Staff.hasMany(ProjectAssignment, { foreignKey: 'staff_id', as: 'assignments' });
ProjectAssignment.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });

// Project -> Progress
Project.hasMany(ProjectProgress, { foreignKey: 'project_id', as: 'progress', onDelete: 'CASCADE' });
ProjectProgress.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// User -> Progress (completed_by)
User.hasMany(ProjectProgress, { foreignKey: 'completed_by', as: 'completed_progress' });
ProjectProgress.belongsTo(User, { foreignKey: 'completed_by', as: 'completed_by_user' });

// Project -> Files
Project.hasMany(ProjectFile, { foreignKey: 'project_id', as: 'files', onDelete: 'CASCADE' });
ProjectFile.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// User -> Files (uploaded_by)
User.hasMany(ProjectFile, { foreignKey: 'uploaded_by', as: 'uploaded_files' });
ProjectFile.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Vehicle -> Usage
Vehicle.hasMany(VehicleUsage, { foreignKey: 'vehicle_id', as: 'usage_records', onDelete: 'CASCADE' });
VehicleUsage.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// Vehicle -> Maintenance
Vehicle.hasMany(VehicleMaintenance, { foreignKey: 'vehicle_id', as: 'maintenance_records', onDelete: 'CASCADE' });
VehicleMaintenance.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// Vehicle -> Maintenance Logs
Vehicle.hasMany(VehicleMaintenanceLog, { foreignKey: 'vehicle_id', as: 'maintenance_logs', onDelete: 'CASCADE' });
VehicleMaintenanceLog.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });


// Staff -> Vehicle Usage
Staff.hasMany(VehicleUsage, { foreignKey: 'staff_id', as: 'vehicle_usage' });
VehicleUsage.belongsTo(Staff, { foreignKey: 'staff_id', as: 'driver' });

// Project -> Vehicle Usage
Project.hasMany(VehicleUsage, { foreignKey: 'project_id', as: 'vehicle_usage' });
VehicleUsage.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Staff -> Assets (current holder)
Staff.hasMany(Asset, { foreignKey: 'current_holder_id', as: 'held_assets' });
Asset.belongsTo(Staff, { foreignKey: 'current_holder_id', as: 'current_holder' });

// Finance Records relationships
Project.hasMany(FinanceRecord, { foreignKey: 'project_id', as: 'finance_records' });
FinanceRecord.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

Staff.hasMany(FinanceRecord, { foreignKey: 'staff_id', as: 'finance_records' });
FinanceRecord.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });

User.hasMany(FinanceRecord, { foreignKey: 'created_by', as: 'created_finance_records' });
FinanceRecord.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Vehicle.hasMany(FinanceRecord, { foreignKey: 'vehicle_id', as: 'finance_records' });
FinanceRecord.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// Recurring Expense relationships
RecurringExpense.hasMany(FinanceRecord, { foreignKey: 'recurring_expense_id', as: 'finance_records' });
FinanceRecord.belongsTo(RecurringExpense, { foreignKey: 'recurring_expense_id', as: 'recurring_expense' });

User.hasMany(RecurringExpense, { foreignKey: 'created_by', as: 'created_recurring_expenses' });
RecurringExpense.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// SystemSettings relationships
User.hasMany(SystemSettings, { foreignKey: 'updated_by', as: 'updated_settings' });
SystemSettings.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

module.exports = {
  sequelize,
  User,
  Client,
  Staff,
  Project,
  ProjectInverter,
  ProjectAssignment,
  ProjectProgress,
  ProjectFile,
  Vehicle,
  VehicleUsage,
  VehicleMaintenance,
  VehicleMaintenanceLog,
  Asset,
  FinanceRecord,
  RecurringExpense,
  SystemSetting,
  SystemSettings
};
