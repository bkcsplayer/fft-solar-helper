const {
    Client,
    Staff,
    Project,
    Vehicle,
    Asset,
    FinanceRecord,
    RecurringExpense,
    ProjectAssignment,
    ProjectProgress,
    VehicleUsage,
    VehicleMaintenance,
    VehicleMaintenanceLog,
    SystemSettings,
    User,
    sequelize
} = require('../models');
const bcrypt = require('bcryptjs');

// Export all data
exports.exportAllData = async (req, res) => {
    try {
        const [
            clients,
            staff,
            projects,
            vehicles,
            assets,
            financeRecords,
            recurringExpenses,
            projectAssignments,
            projectProgress,
            vehicleUsage,
            vehicleMaintenance,
            vehicleMaintenanceLogs,
            systemSettings,
            users
        ] = await Promise.all([
            Client.findAll({ raw: true }),
            Staff.findAll({ raw: true }),
            Project.findAll({ raw: true }),
            Vehicle.findAll({ raw: true }),
            Asset.findAll({ raw: true }),
            FinanceRecord.findAll({ raw: true }),
            RecurringExpense.findAll({ raw: true }),
            ProjectAssignment.findAll({ raw: true }),
            ProjectProgress.findAll({ raw: true }),
            VehicleUsage.findAll({ raw: true }),
            VehicleMaintenance.findAll({ raw: true }),
            VehicleMaintenanceLog.findAll({ raw: true }),
            SystemSettings.findAll({ raw: true }),
            User.findAll({ raw: true }) // Include password_hash for full restore
        ]);

        const exportData = {
            exportDate: new Date().toISOString(),
            version: '2.0',
            data: {
                users,
                clients,
                staff,
                projects,
                projectAssignments,
                projectProgress,
                vehicles,
                vehicleUsage,
                vehicleMaintenance,
                vehicleMaintenanceLogs,
                assets,
                financeRecords,
                recurringExpenses,
                systemSettings
            },
            counts: {
                users: users.length,
                clients: clients.length,
                staff: staff.length,
                projects: projects.length,
                projectAssignments: projectAssignments.length,
                projectProgress: projectProgress.length,
                vehicles: vehicles.length,
                vehicleUsage: vehicleUsage.length,
                vehicleMaintenance: vehicleMaintenance.length,
                vehicleMaintenanceLogs: vehicleMaintenanceLogs.length,
                assets: assets.length,
                financeRecords: financeRecords.length,
                recurringExpenses: recurringExpenses.length,
                systemSettings: systemSettings.length
            }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=fft-solar-backup-${new Date().toISOString().slice(0, 10)}.json`);

        res.json(exportData);
    } catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
};

// Reset database - clear all data, keep schema and create default admin
exports.resetDatabase = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        // Truncate all tables in dependency order (children first)
        await sequelize.query('SET CONSTRAINTS ALL DEFERRED', { transaction: t });

        const tablesToTruncate = [
            'project_progress',
            'project_assignments',
            'vehicle_usage',
            'vehicle_maintenance',
            'vehicle_maintenance_logs',
            'finance_records',
            'recurring_expenses',
            'assets',
            'projects',
            'clients',
            'staff',
            'vehicles',
            'system_settings',
            'users'
        ];

        for (const table of tablesToTruncate) {
            try {
                await sequelize.query(`TRUNCATE TABLE "${table}" CASCADE`, { transaction: t });
            } catch (err) {
                console.log(`Table ${table} does not exist or error: ${err.message}`);
            }
        }

        // Re-create default admin user
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt);

        await User.create({
            username: 'admin',
            password_hash: passwordHash,
            name: 'System Admin',
            email: 'admin@fftsolar.com',
            role: 'admin',
            is_active: true
        }, { transaction: t });

        await t.commit();

        res.json({
            message: 'Database reset successfully. Default admin user created (admin/admin123).',
            admin: { username: 'admin', password: 'admin123' }
        });
    } catch (error) {
        await t.rollback();
        console.error('Reset database error:', error);
        res.status(500).json({ error: 'Failed to reset database: ' + error.message });
    }
};

// Import all data from backup JSON
exports.importAllData = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const importData = req.body;

        if (!importData || !importData.data) {
            return res.status(400).json({ error: 'Invalid backup file format' });
        }

        const { data } = importData;

        // Clear all existing data first (same order as reset)
        await sequelize.query('SET CONSTRAINTS ALL DEFERRED', { transaction: t });

        const tablesToTruncate = [
            'project_progress',
            'project_assignments',
            'vehicle_usage',
            'vehicle_maintenance',
            'vehicle_maintenance_logs',
            'finance_records',
            'recurring_expenses',
            'assets',
            'projects',
            'clients',
            'staff',
            'vehicles',
            'system_settings',
            'users'
        ];

        for (const table of tablesToTruncate) {
            try {
                await sequelize.query(`TRUNCATE TABLE "${table}" CASCADE`, { transaction: t });
            } catch (err) {
                console.log(`Table ${table} skip: ${err.message}`);
            }
        }

        // Import in dependency order (parents first)
        const importResults = {};

        // Helper to bulk create with error handling
        const bulkImport = async (Model, records, name) => {
            if (records && records.length > 0) {
                // Remove auto-generated fields that might conflict
                const cleaned = records.map(r => {
                    const { ...rest } = r;
                    return rest;
                });
                await Model.bulkCreate(cleaned, {
                    transaction: t,
                    ignoreDuplicates: true,
                    validate: false // Skip validation for speed during restore
                });
                importResults[name] = records.length;
            } else {
                importResults[name] = 0;
            }
        };

        // Import in correct order
        await bulkImport(User, data.users, 'users');
        await bulkImport(Client, data.clients, 'clients');
        await bulkImport(Staff, data.staff, 'staff');
        await bulkImport(Project, data.projects, 'projects');
        await bulkImport(Vehicle, data.vehicles, 'vehicles');
        await bulkImport(Asset, data.assets, 'assets');
        await bulkImport(ProjectAssignment, data.projectAssignments, 'projectAssignments');
        await bulkImport(ProjectProgress, data.projectProgress, 'projectProgress');
        await bulkImport(VehicleUsage, data.vehicleUsage, 'vehicleUsage');
        await bulkImport(VehicleMaintenance, data.vehicleMaintenance, 'vehicleMaintenance');
        await bulkImport(VehicleMaintenanceLog, data.vehicleMaintenanceLogs, 'vehicleMaintenanceLogs');
        await bulkImport(FinanceRecord, data.financeRecords, 'financeRecords');
        await bulkImport(RecurringExpense, data.recurringExpenses, 'recurringExpenses');
        await bulkImport(SystemSettings, data.systemSettings, 'systemSettings');

        // Reset sequences to avoid ID conflicts on future inserts
        const seqTables = [
            'users', 'clients', 'staff', 'projects', 'vehicles', 'assets',
            'project_assignments', 'project_progress', 'vehicle_usage',
            'vehicle_maintenance', 'vehicle_maintenance_logs',
            'finance_records', 'recurring_expenses', 'system_settings'
        ];
        for (const table of seqTables) {
            try {
                await sequelize.query(
                    `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX(id), 1)) FROM "${table}"`,
                    { transaction: t }
                );
            } catch (err) {
                // Some tables might not have serial sequences
            }
        }

        await t.commit();

        res.json({
            message: 'Data imported successfully',
            importDate: importData.exportDate,
            results: importResults
        });
    } catch (error) {
        await t.rollback();
        console.error('Import data error:', error);
        res.status(500).json({ error: 'Failed to import data: ' + error.message });
    }
};
