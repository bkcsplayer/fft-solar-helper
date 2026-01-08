const { Staff, ProjectAssignment, Project, Client, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all staff
exports.getStaff = async (req, res) => {
  try {
    const { search, role, is_active } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (role) {
      where.role = role;
    }
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const staff = await Staff.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    res.json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

// Create staff
exports.createStaff = async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json(staff);
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Failed to create staff' });
  }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    await staff.update(req.body);
    res.json(staff);
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Failed to update staff' });
  }
};

// Delete staff (soft delete to preserve work history)
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Soft delete - keep work history
    await staff.update({ is_active: false });
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Failed to delete staff' });
  }
};

// Get staff payment history
exports.getStaffPayments = async (req, res) => {
  try {
    const assignments = await ProjectAssignment.findAll({
      where: { staff_id: req.params.id },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'address', 'customer_name', 'status', 'created_at']
        }
      ],
      order: [['assigned_at', 'DESC']]
    });

    const totalPaid = assignments.reduce((sum, a) => sum + parseFloat(a.calculated_pay || 0), 0);

    res.json({
      assignments,
      total_paid: totalPaid.toFixed(2)
    });
  } catch (error) {
    console.error('Get staff payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};

// Get staff performance details by month/year
exports.getStaffPerformance = async (req, res) => {
  try {
    const staffId = req.params.id;
    const { year, month } = req.query;

    // Validate staff exists
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Build date range
    let startDate, endDate;
    if (year && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else if (year) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // Get all assignments for this staff in the date range
    const assignments = await ProjectAssignment.findAll({
      where: {
        staff_id: staffId,
        assigned_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'address', 'customer_name', 'panel_quantity', 'panel_watt', 'panel_brand', 'status', 'created_at', 'updated_at'],
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['id', 'company_name', 'rate_per_watt']
            }
          ]
        }
      ],
      order: [['assigned_at', 'DESC']]
    });

    // Calculate statistics by project address
    const projectStats = [];
    let totalIncome = 0;
    let totalPanels = 0;

    assignments.forEach(assignment => {
      const project = assignment.project;
      if (!project) return;

      const panelCount = project.panel_quantity || 0;
      const income = parseFloat(assignment.calculated_pay || 0);

      // Calculate revenue if client exists
      let revenue = 0;
      if (project.client && project.panel_watt && project.panel_quantity) {
        const totalWatt = project.panel_watt * project.panel_quantity;
        revenue = totalWatt * parseFloat(project.client.rate_per_watt);
      }

      projectStats.push({
        project_id: project.id,
        address: project.address,
        customer_name: project.customer_name,
        client_name: project.client ? project.client.company_name : null,
        panel_count: panelCount,
        panel_brand: project.panel_brand,
        staff_income: parseFloat(income.toFixed(2)),
        project_revenue: parseFloat(revenue.toFixed(2)),
        status: project.status,
        assigned_at: assignment.assigned_at,
        role: assignment.role_in_project
      });

      totalIncome += income;
      totalPanels += panelCount;
    });

    // Summary statistics
    const summary = {
      staff_id: staff.id,
      staff_name: staff.name,
      staff_role: staff.role,
      pay_type: staff.pay_type,
      pay_rate: parseFloat(staff.pay_rate),
      period: {
        start: startDate,
        end: endDate,
        year: year || startDate.getFullYear(),
        month: month || (startDate.getMonth() + 1)
      },
      total_projects: assignments.length,
      total_panels_installed: totalPanels,
      total_income: parseFloat(totalIncome.toFixed(2)),
      average_income_per_project: assignments.length > 0 ? parseFloat((totalIncome / assignments.length).toFixed(2)) : 0
    };

    res.json({
      summary,
      projects: projectStats
    });
  } catch (error) {
    console.error('Get staff performance error:', error);
    res.status(500).json({ error: 'Failed to fetch staff performance' });
  }
};

// Get staff detail with project history
exports.getStaffDetail = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Get all project assignments
    const assignments = await ProjectAssignment.findAll({
      where: { staff_id: req.params.id },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'address', 'customer_name', 'status', 'created_at'],
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['company_name']
            }
          ]
        }
      ],
      order: [['assigned_at', 'DESC']]
    });

    res.json({
      staff,
      assignments
    });
  } catch (error) {
    console.error('Get staff detail error:', error);
    res.status(500).json({ error: 'Failed to fetch staff detail' });
  }
};

// Get staff projects for a date range
exports.getStaffProjects = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = { staff_id: req.params.id };

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      where.assigned_at = {
        [Op.between]: [start, end]
      };
    }

    const assignments = await ProjectAssignment.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'address', 'customer_name', 'status']
        }
      ],
      order: [['assigned_at', 'DESC']]
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get staff projects error:', error);
    res.status(500).json({ error: 'Failed to fetch staff projects' });
  }
};

// Calculate and send staff timesheet
exports.sendStaffTimesheet = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const { sendStaffTimesheetEmail } = require('../utils/emailService');

    const staff = await Staff.findByPk(req.params.id);

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    if (!staff.email) {
      return res.status(400).json({ error: 'Staff email not configured' });
    }

    // Get assignments in date range
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const assignments = await ProjectAssignment.findAll({
      where: {
        staff_id: req.params.id,
        assigned_at: {
          [Op.between]: [start, end]
        }
      },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['address']
        }
      ],
      order: [['assigned_at', 'ASC']]
    });

    const totalPay = assignments.reduce((sum, a) => sum + parseFloat(a.calculated_pay || 0), 0);

    const projects = assignments.map(a => ({
      address: a.project.address,
      assigned_at: a.assigned_at.toISOString().split('T')[0],
      role: a.role_in_project,
      calculated_pay: a.calculated_pay
    }));

    const timesheetData = {
      startDate,
      endDate,
      projects,
      totalPay
    };

    const result = await sendStaffTimesheetEmail(staff.email, staff.name, timesheetData);

    if (result.success) {
      res.json({
        message: 'Timesheet sent successfully',
        totalPay,
        projectCount: projects.length
      });
    } else {
      res.status(500).json({ error: 'Failed to send email: ' + result.error });
    }
  } catch (error) {
    console.error('Send timesheet error:', error);
    res.status(500).json({ error: 'Failed to send timesheet' });
  }
};
