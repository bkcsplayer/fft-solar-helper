const {
    Project,
    Client,
    Staff,
    ProjectAssignment,
    FinanceRecord,
    VehicleMaintenance,
    Vehicle,
    VehicleUsage,
    Asset,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

class DashboardService {
    /**
     * Calculate dashboard overview statistics for a given period
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    static async getPeriodStats(startDate, endDate) {
        // 1. Projects completed in period
        const completedProjects = await Project.findAll({
            where: {
                status: 'completed',
                completed_at: { [Op.between]: [startDate, endDate] }
            },
            include: [
                { model: Client, as: 'client' },
                { model: ProjectAssignment, as: 'assignments' }
            ]
        });

        // 2. Calculate Project Revenue & Labor Cost
        let projectRevenue = 0;
        let laborCost = 0;

        // Calculate total watt for completed projects
        let totalWatt = 0;

        completedProjects.forEach(project => {
            const pWatt = (project.panel_watt || 0) * (project.panel_quantity || 0);
            totalWatt += pWatt;

            if (project.client) {
                // Handle different price models if needed, currently main logic is rate_per_watt
                // Logic from projectController: 
                // if (client.price_model === 'per_panel') revenue = qty * rate_per_panel
                // else revenue = totalWatt * rate_per_watt
                let revenue = 0;
                if (project.client.price_model === 'per_panel') {
                    revenue = (project.panel_quantity || 0) * parseFloat(project.client.rate_per_panel || 0);
                } else {
                    revenue = pWatt * parseFloat(project.client.rate_per_watt || 0);
                }
                projectRevenue += revenue;
            }

            const projLabor = project.assignments.reduce(
                (sum, a) => sum + parseFloat(a.calculated_pay || 0),
                0
            );
            laborCost += projLabor;
        });

        // 3. Other Income
        const otherIncome = await FinanceRecord.sum('amount', {
            where: {
                record_type: 'income',
                record_date: { [Op.between]: [startDate, endDate] }
            }
        }) || 0;

        // 4. Other Expenses
        const otherExpenses = await FinanceRecord.sum('amount', {
            where: {
                record_type: 'expense',
                record_date: { [Op.between]: [startDate, endDate] }
            }
        }) || 0;

        // 5. Vehicle Costs
        const vehicleCosts = await VehicleMaintenance.sum('cost', {
            where: {
                maintenance_date: { [Op.between]: [startDate, endDate] }
            }
        }) || 0;

        return {
            projects_count: completedProjects.length,
            total_watt: totalWatt,
            revenue: {
                project: projectRevenue,
                other: parseFloat(otherIncome),
                total: projectRevenue + parseFloat(otherIncome)
            },
            expense: {
                labor: laborCost,
                vehicle: parseFloat(vehicleCosts),
                other: parseFloat(otherExpenses),
                total: laborCost + parseFloat(vehicleCosts) + parseFloat(otherExpenses)
            },
            net_profit: (projectRevenue + parseFloat(otherIncome)) - (laborCost + parseFloat(vehicleCosts) + parseFloat(otherExpenses))
        };
    }

    /**
     * Get detailed financial records for a period
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    static async getFinancialDetails(startDate, endDate) {
        // 1. Project Revenue
        const completedProjects = await Project.findAll({
            where: {
                status: 'completed',
                completed_at: { [Op.between]: [startDate, endDate] }
            },
            include: [
                { model: Client, as: 'client', attributes: ['company_name', 'rate_per_watt', 'price_model', 'rate_per_panel'] },
                {
                    model: ProjectAssignment,
                    as: 'assignments',
                    include: [{ model: Staff, as: 'staff', attributes: ['name', 'role'] }]
                }
            ],
            attributes: ['id', 'address', 'panel_quantity', 'panel_watt', 'completed_at']
        });

        const incomeDetails = [];
        const expenseDetails = [];

        completedProjects.forEach(p => {
            // Revenue entry
            const totalWatt = (p.panel_watt || 0) * (p.panel_quantity || 0);
            let amount = 0;
            if (p.client?.price_model === 'per_panel') {
                amount = (p.panel_quantity || 0) * parseFloat(p.client.rate_per_panel || 0);
            } else {
                amount = totalWatt * parseFloat(p.client?.rate_per_watt || 0);
            }

            incomeDetails.push({
                id: p.id,
                type: 'Project Revenue',
                description: `${p.client?.company_name || 'Unknown Client'} - ${p.address}`,
                date: p.completed_at,
                amount: parseFloat(amount.toFixed(2)),
                category: 'project'
            });

            // Labor entries
            if (p.assignments) {
                p.assignments.forEach(a => {
                    if (parseFloat(a.calculated_pay) > 0) {
                        expenseDetails.push({
                            id: `labor_${p.id}_${a.id}`,
                            type: 'Labor Cost',
                            description: `${a.staff?.name || 'Unknown Staff'} (${a.staff?.role || 'Staff'}) - ${p.address}`,
                            date: p.completed_at,
                            amount: parseFloat(a.calculated_pay),
                            category: 'labor'
                        });
                    }
                });
            }
        });

        // 2. Finance Records (Income & Expense)
        const financeRecords = await FinanceRecord.findAll({
            where: {
                record_date: { [Op.between]: [startDate, endDate] }
            }
        });

        financeRecords.forEach(r => {
            const item = {
                id: (r.record_type === 'income' ? 'inc_' : 'exp_') + r.id,
                type: r.record_type === 'income' ? 'Other Income' : 'Other Expense',
                description: r.category + (r.notes ? ` - ${r.notes}` : ''),
                date: r.record_date,
                amount: parseFloat(r.amount),
                category: r.category
            };

            if (r.record_type === 'income') {
                incomeDetails.push(item);
            } else {
                expenseDetails.push(item);
            }
        });

        // 3. Vehicle Maintenance
        const vehicleMaintenance = await VehicleMaintenance.findAll({
            where: {
                maintenance_date: { [Op.between]: [startDate, endDate] }
            },
            include: [{ model: Vehicle, as: 'vehicle', attributes: ['plate_number', 'model'] }]
        });

        vehicleMaintenance.forEach(v => {
            expenseDetails.push({
                id: `veh_${v.id}`,
                type: 'Vehicle Maintenance',
                description: `${v.vehicle?.plate_number} (${v.vehicle?.model}) - ${v.service_type}`,
                date: v.maintenance_date,
                amount: parseFloat(v.cost),
                category: 'vehicle'
            });
        });

        // Sort by date descending
        incomeDetails.sort((a, b) => new Date(b.date) - new Date(a.date));
        expenseDetails.sort((a, b) => new Date(b.date) - new Date(a.date));

        return { income: incomeDetails, expense: expenseDetails };
    }
}

module.exports = DashboardService;
