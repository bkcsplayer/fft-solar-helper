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

// Get dashboard overview
exports.getOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Project statistics
    const projectStats = {
      pending: await Project.count({ where: { status: 'pending' } }),
      in_progress: await Project.count({ where: { status: 'in_progress' } }),
      completed: await Project.count({ where: { status: 'completed' } }),
      completed_this_month: await Project.count({
        where: {
          status: 'completed',
          updated_at: { [Op.between]: [startOfMonth, endOfMonth] }
        }
      })
    };

    // Monthly total watt
    const totalWattResult = await Project.findAll({
      attributes: [
        [sequelize.literal('SUM(panel_watt * panel_quantity)'), 'total_watt']
      ],
      where: {
        status: 'completed',
        updated_at: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      raw: true
    });
    const totalWattThisMonth = parseInt(totalWattResult[0]?.total_watt) || 0;

    // Monthly income
    const completedProjects = await Project.findAll({
      where: {
        status: 'completed',
        updated_at: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      include: [
        { model: Client, as: 'client' },
        { model: ProjectAssignment, as: 'assignments' }
      ]
    });

    let monthlyProjectIncome = 0;
    let monthlyLaborCost = 0;

    completedProjects.forEach(project => {
      if (project.client) {
        const totalWatt = project.panel_watt * project.panel_quantity;
        monthlyProjectIncome += totalWatt * parseFloat(project.client.rate_per_watt);
      }

      const projectExpense = project.assignments.reduce(
        (sum, a) => sum + parseFloat(a.calculated_pay || 0),
        0
      );
      monthlyLaborCost += projectExpense;
    });

    const otherIncome = await FinanceRecord.sum('amount', {
      where: {
        record_type: 'income',
        record_date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    }) || 0;

    const otherExpenses = await FinanceRecord.sum('amount', {
      where: {
        record_type: 'expense',
        record_date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    }) || 0;

    const vehicleCosts = await VehicleMaintenance.sum('cost', {
      where: {
        maintenance_date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    }) || 0;

    const totalIncome = monthlyProjectIncome + parseFloat(otherIncome);
    const totalExpense = monthlyLaborCost + parseFloat(otherExpenses) + parseFloat(vehicleCosts);
    const monthlyProfit = totalIncome - totalExpense;

    res.json({
      projects: projectStats,
      monthly_stats: {
        total_watt: parseInt(totalWattThisMonth),
        income: {
          project_income: parseFloat(monthlyProjectIncome.toFixed(2)),
          other_income: parseFloat(otherIncome),
          total: parseFloat(totalIncome.toFixed(2))
        },
        expense: {
          labor_cost: parseFloat(monthlyLaborCost.toFixed(2)),
          vehicle_cost: parseFloat(vehicleCosts),
          other: parseFloat(otherExpenses),
          total: parseFloat(totalExpense.toFixed(2))
        },
        profit: parseFloat(monthlyProfit.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// Get chart data
exports.getChartData = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const chartData = [];
    const now = new Date();

    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

      const completedProjects = await Project.findAll({
        where: {
          status: 'completed',
          updated_at: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        include: [
          { model: Client, as: 'client' },
          { model: ProjectAssignment, as: 'assignments' }
        ]
      });

      let income = 0;
      let expense = 0;

      completedProjects.forEach(project => {
        if (project.client) {
          const totalWatt = project.panel_watt * project.panel_quantity;
          income += totalWatt * parseFloat(project.client.rate_per_watt);
        }

        const projectExpense = project.assignments.reduce(
          (sum, a) => sum + parseFloat(a.calculated_pay || 0),
          0
        );
        expense += projectExpense;
      });

      const otherIncome = await FinanceRecord.sum('amount', {
        where: {
          record_type: 'income',
          record_date: { [Op.between]: [startOfMonth, endOfMonth] }
        }
      }) || 0;

      const otherExpenses = await FinanceRecord.sum('amount', {
        where: {
          record_type: 'expense',
          record_date: { [Op.between]: [startOfMonth, endOfMonth] }
        }
      }) || 0;

      const vehicleCosts = await VehicleMaintenance.sum('cost', {
        where: {
          maintenance_date: { [Op.between]: [startOfMonth, endOfMonth] }
        }
      }) || 0;

      income += parseFloat(otherIncome);
      expense += parseFloat(otherExpenses) + parseFloat(vehicleCosts);

      chartData.push({
        month: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        income: parseFloat(income.toFixed(2)),
        expense: parseFloat(expense.toFixed(2)),
        profit: parseFloat((income - expense).toFixed(2)),
        projects_completed: completedProjects.length
      });
    }

    res.json(chartData);
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
};

// Get analytics data for charts
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Client Revenue Ranking (all completed projects)
    const clientRevenue = await Project.findAll({
      where: { status: 'completed' },
      include: [{ model: Client, as: 'client' }],
      raw: true,
      nest: true
    });

    const clientRevenueMap = {};
    clientRevenue.forEach(p => {
      if (p.client) {
        const clientName = p.client.company_name;
        const revenue = p.panel_watt * p.panel_quantity * parseFloat(p.client.rate_per_watt);
        clientRevenueMap[clientName] = (clientRevenueMap[clientName] || 0) + revenue;
      }
    });

    const clientRevenueData = Object.entries(clientRevenueMap)
      .map(([name, revenue]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, revenue: parseFloat(revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // 2. Project Status Distribution
    const projectStatus = await Project.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    const statusLabels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed'
    };

    const projectStatusData = projectStatus.map(s => ({
      name: statusLabels[s.status] || s.status,
      value: parseInt(s.count),
      status: s.status
    }));

    // 3. Staff Performance (panels installed)
    const staffPerformance = await ProjectAssignment.findAll({
      include: [
        { model: Staff, as: 'staff', attributes: ['name', 'role'] },
        { 
          model: Project, 
          as: 'project', 
          where: { status: 'completed' },
          attributes: ['panel_quantity']
        }
      ]
    });

    const staffStats = {};
    staffPerformance.forEach(pa => {
      if (pa.staff) {
        const name = pa.staff.name;
        if (!staffStats[name]) {
          staffStats[name] = { 
            name, 
            role: pa.staff.role,
            panels: 0, 
            earnings: 0, 
            projects: 0 
          };
        }
        staffStats[name].panels += pa.project?.panel_quantity || 0;
        staffStats[name].earnings += parseFloat(pa.calculated_pay || 0);
        staffStats[name].projects += 1;
      }
    });

    const staffPerformanceData = Object.values(staffStats)
      .sort((a, b) => b.panels - a.panels)
      .slice(0, 10)
      .map(s => ({
        ...s,
        earnings: parseFloat(s.earnings.toFixed(2))
      }));

    // 4. Expense Categories
    const expenseCategories = await FinanceRecord.findAll({
      where: { record_type: 'expense' },
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['category'],
      raw: true
    });

    const categoryLabels = {
      fuel: 'Fuel',
      tools: 'Tools',
      office: 'Office',
      insurance: 'Insurance',
      utilities: 'Utilities',
      marketing: 'Marketing',
      training: 'Training',
      staff_bonus: 'Staff Bonus'
    };

    const expenseCategoryData = expenseCategories.map(e => ({
      name: categoryLabels[e.category] || e.category,
      value: parseFloat(e.total)
    }));

    // 5. Panel Brands Distribution
    const panelBrands = await Project.findAll({
      attributes: ['panel_brand', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['panel_brand'],
      raw: true
    });

    const panelBrandData = panelBrands.map(b => ({
      name: b.panel_brand,
      value: parseInt(b.count)
    }));

    // 6. Vehicle Usage Statistics
    const vehicleUsage = await VehicleUsage.findAll({
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['plate_number', 'model'] }],
      raw: true,
      nest: true
    });

    const vehicleStats = {};
    vehicleUsage.forEach(u => {
      if (u.vehicle) {
        const plate = u.vehicle.plate_number;
        if (!vehicleStats[plate]) {
          vehicleStats[plate] = { 
            plate, 
            model: u.vehicle.model,
            trips: 0, 
            distance: 0 
          };
        }
        vehicleStats[plate].trips += 1;
        vehicleStats[plate].distance += (u.end_mileage - u.start_mileage) || 0;
      }
    });

    const vehicleUsageData = Object.values(vehicleStats).sort((a, b) => b.distance - a.distance);

    // 7. Monthly Watt Trend (last 6 months)
    const wattTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

      const result = await Project.findAll({
        attributes: [
          [sequelize.literal('SUM(panel_watt * panel_quantity)'), 'total_watt'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'projects']
        ],
        where: {
          status: 'completed',
          updated_at: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        raw: true
      });

      wattTrend.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        watt: parseInt(result[0]?.total_watt) || 0,
        projects: parseInt(result[0]?.projects) || 0
      });
    }

    // 8. Asset Status
    const assetStatus = await Asset.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    const assetStatusLabels = {
      available: 'Available',
      in_use: 'In Use',
      maintenance: 'Maintenance'
    };

    const assetStatusData = assetStatus.map(a => ({
      name: assetStatusLabels[a.status] || a.status,
      value: parseInt(a.count)
    }));

    res.json({
      clientRevenue: clientRevenueData,
      projectStatus: projectStatusData,
      staffPerformance: staffPerformanceData,
      expenseCategories: expenseCategoryData,
      panelBrands: panelBrandData,
      vehicleUsage: vehicleUsageData,
      wattTrend,
      assetStatus: assetStatusData
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};
