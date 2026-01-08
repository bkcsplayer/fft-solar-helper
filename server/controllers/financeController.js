const {
  FinanceRecord,
  RecurringExpense,
  Project,
  Client,
  Staff,
  ProjectAssignment,
  Vehicle,
  VehicleMaintenance,
  User,
  sequelize
} = require('../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

// Get finance records
exports.getFinanceRecords = async (req, res) => {
  try {
    const { record_type, category, start_date, end_date } = req.query;

    const where = {};
    if (record_type) {
      where.record_type = record_type;
    }
    if (category) {
      where.category = category;
    }
    if (start_date && end_date) {
      where.record_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const records = await FinanceRecord.findAll({
      where,
      order: [['record_date', 'DESC']]
    });

    res.json(records);
  } catch (error) {
    console.error('Get finance records error:', error);
    res.status(500).json({ error: 'Failed to fetch finance records' });
  }
};

// Create finance record
exports.createFinanceRecord = async (req, res) => {
  try {
    const record = await FinanceRecord.create({
      ...req.body,
      created_by: req.user.id
    });

    res.status(201).json(record);
  } catch (error) {
    console.error('Create finance record error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to create finance record', details: error.message });
  }
};

// Update finance record
exports.updateFinanceRecord = async (req, res) => {
  try {
    const record = await FinanceRecord.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'Finance record not found' });
    }

    await record.update(req.body);

    const updatedRecord = await FinanceRecord.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'address'] },
        { model: Staff, as: 'staff', attributes: ['id', 'name'] }
      ]
    });

    res.json(updatedRecord);
  } catch (error) {
    console.error('Update finance record error:', error);
    res.status(500).json({ error: 'Failed to update finance record' });
  }
};

// Delete finance record
exports.deleteFinanceRecord = async (req, res) => {
  try {
    const record = await FinanceRecord.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'Finance record not found' });
    }

    await record.destroy();
    res.json({ message: 'Finance record deleted successfully' });
  } catch (error) {
    console.error('Delete finance record error:', error);
    res.status(500).json({ error: 'Failed to delete finance record' });
  }
};

// Get finance summary
exports.getFinanceSummary = async (req, res) => {
  try {
    const { period = 'month', year, month } = req.query;

    let startDate, endDate;

    if (period === 'month') {
      const targetYear = year || new Date().getFullYear();
      const targetMonth = month || new Date().getMonth() + 1;
      startDate = new Date(targetYear, targetMonth - 1, 1);
      endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    } else if (period === 'year') {
      const targetYear = year || new Date().getFullYear();
      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59);
    }

    // Get completed projects revenue
    const completedProjects = await Project.findAll({
      where: {
        status: 'completed',
        updated_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: Client, as: 'client' },
        { model: ProjectAssignment, as: 'assignments' }
      ]
    });

    let totalProjectIncome = 0;
    let totalProjectExpense = 0;
    let totalWattCompleted = 0;
    let averageRatePerWatt = 0;
    const projectDetails = [];

    completedProjects.forEach(project => {
      if (project.client) {
        const totalWatt = project.panel_watt * project.panel_quantity;
        const projectIncome = totalWatt * parseFloat(project.client.rate_per_watt);
        totalProjectIncome += projectIncome;
        totalWattCompleted += totalWatt;

        projectDetails.push({
          project_id: project.id,
          address: project.address,
          total_watt: totalWatt,
          rate_per_watt: parseFloat(project.client.rate_per_watt),
          income: projectIncome
        });
      }

      const projectExpense = project.assignments.reduce(
        (sum, a) => sum + parseFloat(a.calculated_pay || 0),
        0
      );
      totalProjectExpense += projectExpense;
    });

    if (completedProjects.length > 0 && totalWattCompleted > 0) {
      averageRatePerWatt = totalProjectIncome / totalWattCompleted;
    }

    // Get other income with breakdown
    const otherIncomeRecords = await FinanceRecord.findAll({
      where: {
        record_type: 'income',
        record_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['category']
    });

    const otherIncome = otherIncomeRecords.reduce((sum, r) => sum + parseFloat(r.dataValues.total), 0);
    const incomeBreakdown = otherIncomeRecords.map(r => ({
      category: r.category,
      amount: parseFloat(r.dataValues.total)
    }));

    // Get other expenses with detailed breakdown
    const expenseRecords = await FinanceRecord.findAll({
      where: {
        record_type: 'expense',
        record_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['category']
    });

    const otherExpenses = expenseRecords.reduce((sum, r) => sum + parseFloat(r.dataValues.total), 0);
    const expenseBreakdown = expenseRecords.map(r => ({
      category: r.category,
      amount: parseFloat(r.dataValues.total)
    }));

    // Get vehicle maintenance costs
    const vehicleCosts = await VehicleMaintenance.sum('cost', {
      where: {
        maintenance_date: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) || 0;

    // Calculate totals
    const totalIncome = totalProjectIncome + parseFloat(otherIncome);
    const totalExpense = totalProjectExpense + parseFloat(otherExpenses) + parseFloat(vehicleCosts);
    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Get project statistics
    const projectStats = await Project.count({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: ['status']
    });

    const totalWattResult = await Project.findAll({
      attributes: [
        [sequelize.literal('SUM(panel_watt * panel_quantity)'), 'total_watt']
      ],
      where: {
        status: 'completed',
        updated_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      raw: true
    });
    const totalWattInstalled = parseInt(totalWattResult[0]?.total_watt) || 0;

    res.json({
      period: {
        type: period,
        start: startDate,
        end: endDate,
        year: period === 'year' ? year : undefined,
        month: period === 'month' ? month : undefined
      },
      income: {
        project_income: parseFloat(totalProjectIncome.toFixed(2)),
        project_details: projectDetails,
        total_watt_completed: totalWattCompleted,
        average_rate_per_watt: parseFloat(averageRatePerWatt.toFixed(4)),
        other_income: parseFloat(otherIncome.toFixed(2)),
        income_breakdown: incomeBreakdown,
        total: parseFloat(totalIncome.toFixed(2))
      },
      expense: {
        labor_cost: parseFloat(totalProjectExpense.toFixed(2)),
        vehicle_cost: parseFloat(vehicleCosts.toFixed(2)),
        other_expenses: parseFloat(otherExpenses.toFixed(2)),
        expense_breakdown: expenseBreakdown,
        total: parseFloat(totalExpense.toFixed(2))
      },
      profit: parseFloat(netProfit.toFixed(2)),
      profit_margin: parseFloat(profitMargin.toFixed(2)),
      projects: {
        completed: completedProjects.length,
        total_watt_installed: parseInt(totalWattInstalled)
      }
    });
  } catch (error) {
    console.error('Get finance summary error:', error);
    res.status(500).json({ error: 'Failed to fetch finance summary' });
  }
};

// Get project finance report
exports.getProjectFinanceReport = async (req, res) => {
  try {
    const { start_date, end_date, status } = req.query;

    const where = {};
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    if (status) {
      where.status = status;
    }

    const projects = await Project.findAll({
      where,
      include: [
        { model: Client, as: 'client' },
        { model: ProjectAssignment, as: 'assignments' }
      ],
      order: [['created_at', 'DESC']]
    });

    const report = projects.map(project => {
      const totalWatt = project.panel_watt * project.panel_quantity;
      const revenue = project.client ?
        totalWatt * parseFloat(project.client.rate_per_watt) : 0;

      const expense = project.assignments.reduce(
        (sum, a) => sum + parseFloat(a.calculated_pay || 0),
        0
      );

      return {
        id: project.id,
        address: project.address,
        customer_name: project.customer_name,
        status: project.status,
        total_watt: totalWatt,
        revenue: parseFloat(revenue.toFixed(2)),
        expense: parseFloat(expense.toFixed(2)),
        profit: parseFloat((revenue - expense).toFixed(2)),
        created_at: project.created_at
      };
    });

    const totals = report.reduce(
      (acc, p) => ({
        revenue: acc.revenue + p.revenue,
        expense: acc.expense + p.expense,
        profit: acc.profit + p.profit
      }),
      { revenue: 0, expense: 0, profit: 0 }
    );

    res.json({
      projects: report,
      totals: {
        revenue: parseFloat(totals.revenue.toFixed(2)),
        expense: parseFloat(totals.expense.toFixed(2)),
        profit: parseFloat(totals.profit.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get project finance report error:', error);
    res.status(500).json({ error: 'Failed to fetch project finance report' });
  }
};

// Get staff payment report
exports.getStaffPaymentReport = async (req, res) => {
  try {
    const { start_date, end_date, role } = req.query;

    const where = {};
    if (start_date && end_date) {
      where.assigned_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const staffWhere = {};
    if (role) {
      staffWhere.role = role;
    }

    const assignments = await ProjectAssignment.findAll({
      where,
      include: [
        {
          model: Staff,
          as: 'staff',
          where: staffWhere,
          attributes: ['id', 'name', 'role']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'address']
        }
      ]
    });

    // Group by staff
    const staffPayments = {};
    assignments.forEach(assignment => {
      const staffId = assignment.staff.id;
      if (!staffPayments[staffId]) {
        staffPayments[staffId] = {
          staff_id: staffId,
          staff_name: assignment.staff.name,
          role: assignment.staff.role,
          projects: [],
          total_payment: 0
        };
      }

      staffPayments[staffId].projects.push({
        project_id: assignment.project.id,
        project_address: assignment.project.address,
        payment: parseFloat(assignment.calculated_pay || 0),
        assigned_at: assignment.assigned_at
      });

      staffPayments[staffId].total_payment += parseFloat(assignment.calculated_pay || 0);
    });

    const report = Object.values(staffPayments).map(sp => ({
      ...sp,
      total_payment: parseFloat(sp.total_payment.toFixed(2))
    }));

    const grandTotal = report.reduce((sum, sp) => sum + sp.total_payment, 0);

    res.json({
      staff_payments: report,
      grand_total: parseFloat(grandTotal.toFixed(2))
    });
  } catch (error) {
    console.error('Get staff payment report error:', error);
    res.status(500).json({ error: 'Failed to fetch staff payment report' });
  }
};

// ============ Recurring Expenses ============

// Get all recurring expenses
exports.getRecurringExpenses = async (req, res) => {
  try {
    const { is_active } = req.query;

    const where = {};
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const expenses = await RecurringExpense.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get recurring expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch recurring expenses' });
  }
};

// Create recurring expense
exports.createRecurringExpense = async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      created_by: req.user.id
    };

    const expense = await RecurringExpense.create(expenseData);

    const fullExpense = await RecurringExpense.findByPk(expense.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json(fullExpense);
  } catch (error) {
    console.error('Create recurring expense error:', error);
    res.status(500).json({ error: 'Failed to create recurring expense' });
  }
};

// Update recurring expense
exports.updateRecurringExpense = async (req, res) => {
  try {
    const expense = await RecurringExpense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }

    await expense.update(req.body);

    const updatedExpense = await RecurringExpense.findByPk(expense.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update recurring expense error:', error);
    res.status(500).json({ error: 'Failed to update recurring expense' });
  }
};

// Delete recurring expense
exports.deleteRecurringExpense = async (req, res) => {
  try {
    const expense = await RecurringExpense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }

    await expense.destroy();
    res.json({ message: 'Recurring expense deleted successfully' });
  } catch (error) {
    console.error('Delete recurring expense error:', error);
    res.status(500).json({ error: 'Failed to delete recurring expense' });
  }
};

// Process recurring expenses (to be called by cron job or manually)
exports.processRecurringExpenses = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get all active recurring expenses
    const expenses = await RecurringExpense.findAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: todayStr },
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: todayStr } }
        ]
      }
    });

    const processedRecords = [];

    for (const expense of expenses) {
      // Check if we need to process this expense
      let shouldProcess = false;
      let nextDate = null;

      if (!expense.last_processed_date) {
        // First time processing
        shouldProcess = true;
        nextDate = expense.start_date;
      } else {
        const lastProcessed = new Date(expense.last_processed_date);
        const daysSince = Math.floor((today - lastProcessed) / (1000 * 60 * 60 * 24));

        if (expense.frequency === 'monthly') {
          // Process if it's been at least 30 days
          if (daysSince >= 30) {
            shouldProcess = true;
            const nextMonth = new Date(lastProcessed);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            nextDate = nextMonth.toISOString().split('T')[0];
          }
        } else if (expense.frequency === 'weekly') {
          if (daysSince >= 7) {
            shouldProcess = true;
            const nextWeek = new Date(lastProcessed);
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextDate = nextWeek.toISOString().split('T')[0];
          }
        } else if (expense.frequency === 'yearly') {
          if (daysSince >= 365) {
            shouldProcess = true;
            const nextYear = new Date(lastProcessed);
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            nextDate = nextYear.toISOString().split('T')[0];
          }
        }
      }

      if (shouldProcess) {
        // Create finance record
        const record = await FinanceRecord.create({
          record_date: nextDate || todayStr,
          record_type: 'expense',
          category: expense.category,
          amount: expense.amount,
          recurring_expense_id: expense.id,
          is_recurring: true,
          notes: `Auto-generated from recurring expense: ${expense.name}`,
          created_by: expense.created_by
        }, { transaction: t });

        // Update last_processed_date
        await expense.update({
          last_processed_date: nextDate || todayStr
        }, { transaction: t });

        processedRecords.push(record);
      }
    }

    await t.commit();

    res.json({
      message: `Processed ${processedRecords.length} recurring expenses`,
      records: processedRecords
    });
  } catch (error) {
    await t.rollback();
    console.error('Process recurring expenses error:', error);
    res.status(500).json({ error: 'Failed to process recurring expenses' });
  }
};
