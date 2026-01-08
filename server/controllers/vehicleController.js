const { Vehicle, VehicleUsage, VehicleMaintenance, Staff, Project } = require('../models');
const { Op } = require('sequelize');

// Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const { is_active } = req.query;

    const where = {};
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const vehicles = await Vehicle.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    res.json(vehicles);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

// Create vehicle
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await vehicle.update(req.body);
    res.json(vehicle);
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Hard delete - completely remove from database
    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
};

// Get vehicle usage records
exports.getVehicleUsage = async (req, res) => {
  try {
    const usage = await VehicleUsage.findAll({
      where: { vehicle_id: req.params.id },
      include: [
        { model: Staff, as: 'driver', attributes: ['id', 'name'] },
        { model: Project, as: 'project', attributes: ['id', 'address'] }
      ],
      order: [['usage_date', 'DESC']]
    });

    const totalDistance = usage.reduce((sum, u) => sum + (u.end_mileage - u.start_mileage), 0);

    res.json({
      usage,
      total_distance: totalDistance
    });
  } catch (error) {
    console.error('Get vehicle usage error:', error);
    res.status(500).json({ error: 'Failed to fetch usage records' });
  }
};

// Add vehicle usage record
exports.addVehicleUsage = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const usage = await VehicleUsage.create({
      ...req.body,
      vehicle_id: req.params.id
    });

    // Update vehicle current mileage
    await vehicle.update({ current_mileage: req.body.end_mileage });

    const usageWithRelations = await VehicleUsage.findByPk(usage.id, {
      include: [
        { model: Staff, as: 'driver', attributes: ['id', 'name'] },
        { model: Project, as: 'project', attributes: ['id', 'address'] }
      ]
    });

    res.status(201).json(usageWithRelations);
  } catch (error) {
    console.error('Add vehicle usage error:', error);
    res.status(500).json({ error: 'Failed to add usage record' });
  }
};

// Get vehicle maintenance records
exports.getVehicleMaintenance = async (req, res) => {
  try {
    const maintenance = await VehicleMaintenance.findAll({
      where: { vehicle_id: req.params.id },
      order: [['maintenance_date', 'DESC']]
    });

    const totalCost = maintenance.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);

    res.json({
      maintenance,
      total_cost: totalCost.toFixed(2)
    });
  } catch (error) {
    console.error('Get vehicle maintenance error:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
};

// Add vehicle maintenance record
exports.addVehicleMaintenance = async (req, res) => {
  try {
    const maintenance = await VehicleMaintenance.create({
      ...req.body,
      vehicle_id: req.params.id
    });

    res.status(201).json(maintenance);
  } catch (error) {
    console.error('Add vehicle maintenance error:', error);
    res.status(500).json({ error: 'Failed to add maintenance record' });
  }
};

// Upload vehicle documents
exports.uploadVehicleDocuments = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const files = req.files || [];
    const existingDocs = vehicle.vehicle_documents || [];

    const newDocs = files.map(file => ({
      id: Date.now() + Math.random(),
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `vehicles/${file.filename}`,
      uploadedAt: new Date()
    }));

    vehicle.vehicle_documents = [...existingDocs, ...newDocs];
    await vehicle.save();

    res.json({
      message: 'Documents uploaded successfully',
      documents: newDocs
    });
  } catch (error) {
    console.error('Upload vehicle documents error:', error);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
};

// Delete vehicle document
exports.deleteVehicleDocument = async (req, res) => {
  try {
    const { deleteFile } = require('../utils/fileUpload');
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const docId = parseFloat(req.params.docId);
    const docs = vehicle.vehicle_documents || [];
    const docToDelete = docs.find(d => d.id === docId);

    if (docToDelete) {
      await deleteFile(docToDelete.path);
      vehicle.vehicle_documents = docs.filter(d => d.id !== docId);
      await vehicle.save();
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

// Get vehicle maintenance logs (using new table)
const { VehicleMaintenanceLog } = require('../models');

exports.getMaintenanceLogs = async (req, res) => {
  try {
    const logs = await VehicleMaintenanceLog.findAll({
      where: { vehicle_id: req.params.id },
      order: [['maintenance_date', 'DESC']]
    });

    const totalCost = logs.reduce((sum, log) => sum + parseFloat(log.cost || 0), 0);

    res.json({
      logs,
      total_cost: totalCost.toFixed(2)
    });
  } catch (error) {
    console.error('Get maintenance logs error:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance logs' });
  }
};

// Create maintenance log
exports.createMaintenanceLog = async (req, res) => {
  try {
    const log = await VehicleMaintenanceLog.create({
      ...req.body,
      vehicle_id: req.params.id
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Create maintenance log error:', error);
    res.status(500).json({ error: 'Failed to create maintenance log' });
  }
};

// Update maintenance log
exports.updateMaintenanceLog = async (req, res) => {
  try {
    const log = await VehicleMaintenanceLog.findByPk(req.params.logId);

    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }

    await log.update(req.body);
    res.json(log);
  } catch (error) {
    console.error('Update maintenance log error:', error);
    res.status(500).json({ error: 'Failed to update maintenance log' });
  }
};

// Delete maintenance log
exports.deleteMaintenanceLog = async (req, res) => {
  try {
    const log = await VehicleMaintenanceLog.findByPk(req.params.logId);

    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }

    await log.destroy();
    res.json({ message: 'Maintenance log deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance log error:', error);
    res.status(500).json({ error: 'Failed to delete maintenance log' });
  }
};

// Send vehicle report email
exports.sendVehicleReport = async (req, res) => {
  try {
    const { sendVehicleReportEmail } = require('../utils/emailService');
    const { SystemSetting, User } = require('../models');

    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Get maintenance logs
    const logs = await VehicleMaintenanceLog.findAll({
      where: { vehicle_id: req.params.id },
      order: [['maintenance_date', 'DESC']]
    });

    // Get admin email
    const adminUser = await User.findByPk(req.user.id);
    const adminEmail = adminUser.email || process.env.EMAIL_USER;

    if (!adminEmail) {
      return res.status(400).json({ error: 'Admin email not configured' });
    }

    const vehicleData = {
      plate_number: vehicle.plate_number,
      model: vehicle.model,
      current_mileage: vehicle.current_mileage
    };

    const maintenanceLogs = logs.map(log => ({
      maintenance_date: log.maintenance_date,
      maintenance_type: log.maintenance_type,
      description: log.description,
      cost: log.cost,
      performed_by: log.performed_by
    }));

    const result = await sendVehicleReportEmail(adminEmail, vehicleData, maintenanceLogs);

    if (result.success) {
      res.json({
        message: 'Vehicle report sent successfully',
        logCount: logs.length
      });
    } else {
      res.status(500).json({ error: 'Failed to send email: ' + result.error });
    }
  } catch (error) {
    console.error('Send vehicle report error:', error);
    res.status(500).json({ error: 'Failed to send vehicle report' });
  }
};
