const {
  Staff,
  ProjectAssignment,
  Project,
  Client,
  sequelize
} = require('../models');
const { Op } = require('sequelize');

// Get staff statistics by month/year
exports.getStaffStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Build date filter
    let dateFilter = {};
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateFilter = {
        assigned_at: {
          [Op.between]: [startDate, endDate]
        }
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      dateFilter = {
        assigned_at: {
          [Op.between]: [startDate, endDate]
        }
      };
    }

    // Get assignments with project details
    const assignments = await ProjectAssignment.findAll({
      where: {
        staff_id: id,
        ...dateFilter
      },
      include: [
        {
          model: Project,
          as: 'project',
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['company_name', 'rate_per_watt']
            }
          ]
        }
      ],
      order: [['assigned_at', 'DESC']]
    });

    // Calculate statistics
    const totalIncome = assignments.reduce((sum, a) => sum + parseFloat(a.calculated_pay || 0), 0);
    const totalPanels = assignments.reduce((sum, a) => sum + (a.project?.panel_quantity || 0), 0);
    const projectCount = assignments.length;

    // Group by project address
    const projectDetails = assignments.map(assignment => ({
      id: assignment.project?.id,
      address: assignment.project?.address,
      panel_quantity: assignment.project?.panel_quantity || 0,
      panel_watt: assignment.project?.panel_watt || 0,
      total_watt: assignment.project?.total_watt || 0,
      role: assignment.role_in_project,
      income: parseFloat(assignment.calculated_pay || 0),
      rate_per_watt: assignment.project?.client?.rate_per_watt || 0,
      client_name: assignment.project?.client?.company_name,
      assigned_at: assignment.assigned_at,
      project_status: assignment.project?.status
    }));

    res.json({
      staff: {
        id: staff.id,
        name: staff.name,
        phone: staff.phone,
        email: staff.email,
        pay_type: staff.pay_type,
        pay_rate: staff.pay_rate
      },
      period: {
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null
      },
      summary: {
        total_income: totalIncome.toFixed(2),
        total_panels: totalPanels,
        project_count: projectCount,
        average_income_per_project: projectCount > 0 ? (totalIncome / projectCount).toFixed(2) : '0.00'
      },
      projects: projectDetails
    });
  } catch (error) {
    console.error('Get staff stats error:', error);
    res.status(500).json({ error: 'Failed to fetch staff statistics' });
  }
};

module.exports = {
  getStaffStats
};

