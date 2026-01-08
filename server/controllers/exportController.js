const {
    Client,
    Staff,
    Project,
    Vehicle,
    Asset,
    FinanceRecord,
    RecurringExpense,
    ProjectAssignment,
    VehicleUsage,
    VehicleMaintenance,
    VehicleMaintenanceLog,
    User
} = require('../models');

// Export all data
exports.exportAllData = async (req, res) => {
    try {
        // Fetch all data from all tables
        const [
            clients,
            staff,
            projects,
            vehicles,
            assets,
            financeRecords,
            recurringExpenses,
            projectAssignments,
            vehicleUsage,
            vehicleMaintenance,
            vehicleMaintenanceLogs,
            users
        ] = await Promise.all([
            Client.findAll(),
            Staff.findAll(),
            Project.findAll(),
            Vehicle.findAll(),
            Asset.findAll(),
            FinanceRecord.findAll(),
            RecurringExpense.findAll(),
            ProjectAssignment.findAll(),
            VehicleUsage.findAll(),
            VehicleMaintenance.findAll(),
            VehicleMaintenanceLog.findAll(),
            User.findAll({ attributes: { exclude: ['password'] } }) // Exclude password for security
        ]);

        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: {
                clients,
                staff,
                projects,
                vehicles,
                assets,
                financeRecords,
                recurringExpenses,
                projectAssignments,
                vehicleUsage,
                vehicleMaintenance,
                vehicleMaintenanceLogs,
                users
            },
            counts: {
                clients: clients.length,
                staff: staff.length,
                projects: projects.length,
                vehicles: vehicles.length,
                assets: assets.length,
                financeRecords: financeRecords.length,
                recurringExpenses: recurringExpenses.length,
                projectAssignments: projectAssignments.length,
                vehicleUsage: vehicleUsage.length,
                vehicleMaintenance: vehicleMaintenance.length,
                vehicleMaintenanceLogs: vehicleMaintenanceLogs.length,
                users: users.length
            }
        };

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=fft-solar-export-${Date.now()}.json`);

        res.json(exportData);
    } catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
};
