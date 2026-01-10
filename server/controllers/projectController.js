const {
  Project,
  Client,
  ProjectInverter,
  ProjectAssignment,
  ProjectProgress,
  ProjectFile,
  ProjectLog,
  Staff,
  User,
  sequelize
} = require('../models');
const { Op } = require('sequelize');
const { sendProjectAssignmentEmail } = require('../utils/emailService');
const telegram = require('../services/telegramService');
const path = require('path');
const fs = require('fs');

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const { search, status, client_id, start_date, end_date } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { address: { [Op.iLike]: `%${search}%` } },
        { customer_name: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      where.status = status;
    }
    if (client_id) {
      where.client_id = client_id;
    }
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const projects = await Project.findAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'company_name', 'rate_per_watt']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate revenue for each project
    const projectsWithRevenue = projects.map(p => {
      const project = p.toJSON();
      const totalWatt = project.panel_watt * project.panel_quantity;
      project.total_watt = totalWatt;

      if (project.client) {
        if (project.client.price_model === 'per_panel') {
          project.project_revenue = (project.panel_quantity * parseFloat(project.client.rate_per_panel || 0)).toFixed(2);
        } else {
          project.project_revenue = (totalWatt * parseFloat(project.client.rate_per_watt || 0)).toFixed(2);
        }
      } else {
        project.project_revenue = 0;
      }
      return project;
    });

    res.json(projectsWithRevenue);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Create project
exports.createProject = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { inverters, ...projectData } = req.body;

    // Create project
    const project = await Project.create(projectData, { transaction: t });

    // Create inverters if provided
    if (inverters && inverters.length > 0) {
      const inverterData = inverters.map(inv => ({
        ...inv,
        project_id: project.id
      }));
      await ProjectInverter.bulkCreate(inverterData, { transaction: t });
    }

    // Create 4 progress stages
    let stages = ['roof_base', 'electrical', 'roof_install', 'bird_net'];
    if (projectData.project_type === 'insurance') {
      stages = ['removal', ...stages];
    }

    const progressData = stages.map(stage => ({
      project_id: project.id,
      stage,
      is_completed: false
    }));
    await ProjectProgress.bulkCreate(progressData, { transaction: t });

    // Initial log
    await ProjectLog.create({
      project_id: project.id,
      content: `Project created as ${projectData.project_type || 'standard'} type`,
      log_type: 'system',
      created_by: req.user ? req.user.id : null
    }, { transaction: t });

    await t.commit();

    // Fetch complete project
    const completeProject = await Project.findByPk(project.id, {
      include: [
        { model: Client, as: 'client' },
        { model: ProjectInverter, as: 'inverters' },
        { model: ProjectProgress, as: 'progress' }
      ]
    });

    // Send Telegram notification
    telegram.notifyProjectCreated(completeProject).catch(err =>
      console.error('Telegram notification failed:', err)
    );

    res.status(201).json(completeProject);
  } catch (error) {
    await t.rollback();
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: ProjectInverter, as: 'inverters' },
        {
          model: ProjectAssignment,
          as: 'assignments',
          include: [{ model: Staff, as: 'staff' }]
        },
        { model: ProjectProgress, as: 'progress' }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectData = project.toJSON();

    // Calculate financials
    const totalWatt = projectData.panel_watt * projectData.panel_quantity;
    projectData.total_watt = totalWatt;

    if (projectData.client) {
      if (projectData.client.price_model === 'per_panel') {
        projectData.project_revenue = (projectData.panel_quantity * parseFloat(projectData.client.rate_per_panel || 0)).toFixed(2);
      } else {
        projectData.project_revenue = (totalWatt * parseFloat(projectData.client.rate_per_watt || 0)).toFixed(2);
      }
    }

    const totalExpense = projectData.assignments.reduce(
      (sum, a) => sum + parseFloat(a.calculated_pay || 0),
      0
    );
    projectData.project_expense = totalExpense.toFixed(2);
    projectData.project_profit = (parseFloat(projectData.project_revenue || 0) - totalExpense).toFixed(2);

    res.json(projectData);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.update(req.body);

    const updatedProject = await Project.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: ProjectInverter, as: 'inverters' },
        { model: ProjectAssignment, as: 'assignments' },
        { model: ProjectProgress, as: 'progress' }
      ]
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// Inverter management
exports.addInverter = async (req, res) => {
  try {
    const inverter = await ProjectInverter.create({
      ...req.body,
      project_id: req.params.id
    });
    res.status(201).json(inverter);
  } catch (error) {
    console.error('Add inverter error:', error);
    res.status(500).json({ error: 'Failed to add inverter' });
  }
};

exports.updateInverter = async (req, res) => {
  try {
    const inverter = await ProjectInverter.findByPk(req.params.inverterId);

    if (!inverter) {
      return res.status(404).json({ error: 'Inverter not found' });
    }

    await inverter.update(req.body);
    res.json(inverter);
  } catch (error) {
    console.error('Update inverter error:', error);
    res.status(500).json({ error: 'Failed to update inverter' });
  }
};

exports.deleteInverter = async (req, res) => {
  try {
    const inverter = await ProjectInverter.findByPk(req.params.inverterId);

    if (!inverter) {
      return res.status(404).json({ error: 'Inverter not found' });
    }

    await inverter.destroy();
    res.json({ message: 'Inverter deleted successfully' });
  } catch (error) {
    console.error('Delete inverter error:', error);
    res.status(500).json({ error: 'Failed to delete inverter' });
  }
};

// Assignment management
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await ProjectAssignment.findAll({
      where: { project_id: req.params.id },
      include: [{ model: Staff, as: 'staff' }]
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

exports.assignStaff = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { staff_id, role_in_project, phase } = req.body;

    // Get project and staff
    const project = await Project.findByPk(req.params.id);
    const staff = await Staff.findByPk(staff_id);

    if (!project || !staff) {
      await t.rollback();
      return res.status(404).json({ error: 'Project or staff not found' });
    }

    // Calculate pay
    let calculated_pay;
    if (staff.pay_type === 'per_panel') {
      calculated_pay = project.panel_quantity * parseFloat(staff.pay_rate);
    } else {
      calculated_pay = parseFloat(staff.pay_rate);
    }

    // Create assignment
    const assignment = await ProjectAssignment.create({
      project_id: project.id,
      staff_id: staff.id,
      role_in_project,
      phase: phase || 'standard',
      calculated_pay,
      paid_amount: calculated_pay // Default paid amount to actual pay
    }, { transaction: t });

    // Update project status to in_progress if it was pending
    if (project.status === 'pending') {
      await project.update({ status: 'in_progress' }, { transaction: t });
    }

    await t.commit();

    const assignmentWithStaff = await ProjectAssignment.findByPk(assignment.id, {
      include: [{ model: Staff, as: 'staff' }]
    });

    // Send Telegram notification
    telegram.notifyStaffAssigned(project, staff, role_in_project).catch(err =>
      console.error('Telegram notification failed:', err)
    );

    res.status(201).json(assignmentWithStaff);
  } catch (error) {
    await t.rollback();
    console.error('Assign staff error:', error);
    res.status(500).json({ error: 'Failed to assign staff' });
  }
};

// Update staff payment
exports.updateStaffPayment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { paid_amount, payment_notes } = req.body;

    console.log('=== UPDATE STAFF PAYMENT ===');
    console.log('Assignment ID:', assignmentId);
    console.log('Request body:', req.body);
    console.log('Paid Amount:', paid_amount);

    const assignment = await ProjectAssignment.findByPk(assignmentId);

    if (!assignment) {
      console.log('Assignment not found:', assignmentId);
      return res.status(404).json({ error: 'Assignment not found' });
    }

    console.log('Current assignment:', assignment.toJSON());

    // Validate amount doesn't exceed calculated pay
    if (parseFloat(paid_amount) > parseFloat(assignment.calculated_pay)) {
      return res.status(400).json({
        error: '已付薪资不能超过实发薪资'
      });
    }

    if (parseFloat(paid_amount) < 0) {
      return res.status(400).json({
        error: '已付薪资不能为负数'
      });
    }

    console.log('Updating with paid_amount:', paid_amount);

    await assignment.update({
      paid_amount: paid_amount || 0,
      payment_notes,
      last_payment_date: new Date()
    });

    console.log('Updated assignment, refetching...');

    const updatedAssignment = await ProjectAssignment.findByPk(assignmentId, {
      include: [{ model: Staff, as: 'staff' }]
    });

    console.log('Updated assignment data:', updatedAssignment.toJSON());

    res.json({
      message: '已付薪资更新成功',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

exports.removeAssignment = async (req, res) => {
  try {
    const assignment = await ProjectAssignment.findByPk(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await assignment.destroy();
    res.json({ message: 'Assignment removed successfully' });
  } catch (error) {
    console.error('Remove assignment error:', error);
    res.status(500).json({ error: 'Failed to remove assignment' });
  }
};

// Send notifications
exports.notifyStaff = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: ProjectAssignment,
          as: 'assignments',
          include: [{ model: Staff, as: 'staff' }]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const results = [];

    for (const assignment of project.assignments) {
      // 移除 is_notified 检查，允许重复发送
      if (assignment.staff.email) {
        const emailResult = await sendProjectAssignmentEmail(
          assignment.staff.email,
          assignment.staff.name,
          project,
          assignment.role_in_project,
          assignment.calculated_pay
        );

        if (emailResult.success) {
          await assignment.update({ is_notified: true });
          results.push({ staff_id: assignment.staff_id, success: true });
        } else {
          results.push({ staff_id: assignment.staff_id, success: false, error: emailResult.error });
        }
      }
    }

    res.json({
      message: 'Notifications sent',
      results
    });
  } catch (error) {
    console.error('Notify staff error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
};

// Progress management
exports.getProgress = async (req, res) => {
  try {
    const progress = await ProjectProgress.findAll({
      where: { project_id: req.params.id },
      order: [
        [sequelize.literal("CASE stage WHEN 'roof_base' THEN 1 WHEN 'electrical' THEN 2 WHEN 'roof_install' THEN 3 WHEN 'bird_net' THEN 4 END"), 'ASC']
      ]
    });

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { is_completed, inspection_status, inspection_fail_reason, inspection_notes } = req.body;
    const { id: projectId, stage } = req.params;

    const progress = await ProjectProgress.findOne({
      where: { project_id: projectId, stage }
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress stage not found' });
    }

    const updateData = {
      is_completed,
      completed_at: is_completed ? new Date() : null,
      completed_by: is_completed ? req.user.id : null
    };

    // Handle inspection status
    if (inspection_status !== undefined) {
      updateData.inspection_status = inspection_status;
      updateData.inspection_date = new Date();

      if (inspection_status === 'fail' && inspection_fail_reason) {
        updateData.inspection_fail_reason = inspection_fail_reason;
      }

      if (inspection_notes) {
        updateData.inspection_notes = inspection_notes;
      }
    }

    await progress.update(updateData);

    // Check if all stages are complete
    const allProgress = await ProjectProgress.findAll({
      where: { project_id: projectId }
    });

    const allComplete = allProgress.every(p => p.is_completed);

    if (allComplete) {
      await Project.update(
        { status: 'completed' },
        { where: { id: projectId } }
      );
    }

    // Send Telegram notification
    const projectData = await Project.findByPk(projectId);
    if (projectData && is_completed) {
      telegram.notifyProgressUpdate(projectData, stage, is_completed).catch(err =>
        console.error('Telegram notification failed:', err)
      );
    }

    res.json(progress);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};

// Get project finance
exports.getProjectFinance = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        {
          model: ProjectAssignment,
          as: 'assignments',
          include: [{ model: Staff, as: 'staff' }]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const totalWatt = project.panel_watt * project.panel_quantity;
    const revenue = project.client ?
      parseFloat((totalWatt * parseFloat(project.client.rate_per_watt)).toFixed(2)) : 0;

    const expenses = project.assignments.map(a => ({
      staff_name: a.staff.name,
      role: a.role_in_project,
      amount: parseFloat(a.calculated_pay)
    }));

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = revenue - totalExpense;

    res.json({
      revenue: revenue.toFixed(2),
      expenses,
      total_expense: totalExpense.toFixed(2),
      profit: profit.toFixed(2)
    });
  } catch (error) {
    console.error('Get project finance error:', error);
    res.status(500).json({ error: 'Failed to fetch project finance' });
  }
};

// File management
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { file_type, notes } = req.body;
    const projectId = req.params.id;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      // Delete uploaded file if project doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Project not found' });
    }

    // Extract relative path from uploads directory
    // req.file.path might be: /app/uploads/project-13/filename.png or C:\path\uploads\project-13\file.png
    // We want: project-13/filename.png
    let relativePath = req.file.path.replace(/\\/g, '/'); // Normalize backslashes

    // Remove everything up to and including "uploads/"
    const uploadsMatch = relativePath.match(/uploads\/(.+)$/);
    if (uploadsMatch) {
      relativePath = uploadsMatch[1]; // Get everything after "uploads/"
    } else {
      // Fallback to just filename if pattern doesn't match
      relativePath = req.file.filename;
    }

    console.log('Storing file path:', relativePath); // Debug log

    // Create file record
    const projectFile = await ProjectFile.create({
      project_id: projectId,
      file_name: req.file.originalname,
      file_path: relativePath, // Store only the relative path
      file_type: file_type || 'document',
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: req.user.id,
      notes: notes || null
    });

    res.status(201).json(projectFile);
  } catch (error) {
    console.error('Upload file error:', error);
    // Clean up file if database insert fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const { file_type } = req.query;
    const where = { project_id: req.params.id };

    if (file_type) {
      where.file_type = file_type;
    }

    const files = await ProjectFile.findAll({
      where,
      order: [['uploaded_at', 'DESC']]
    });

    res.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await ProjectFile.findByPk(req.params.fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete physical file
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    // Delete database record
    await file.destroy();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

// Create log
exports.createLog = async (req, res) => {
  try {
    const { content, log_type } = req.body;
    const project_id = req.params.id;

    const log = await ProjectLog.create({
      project_id,
      content,
      log_type: log_type || 'note',
      created_by: req.user.id
    });

    const completeLog = await ProjectLog.findByPk(log.id, {
      include: [{ model: User, as: 'creator', attributes: ['name'] }]
    });

    res.status(201).json(completeLog);
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
};

// Create log
exports.createLog = async (req, res) => {
  try {
    const { content, log_type } = req.body;
    const project_id = req.params.id;

    const log = await ProjectLog.create({
      project_id,
      content,
      log_type: log_type || 'note',
      created_by: req.user.id
    });

    const completeLog = await ProjectLog.findByPk(log.id, {
      include: [{ model: User, as: 'creator', attributes: ['name'] }]
    });

    res.status(201).json(completeLog);
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
};
