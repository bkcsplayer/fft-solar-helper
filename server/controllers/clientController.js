const { Client, Project } = require('../models');
const { Op } = require('sequelize');

// Get all clients
exports.getClients = async (req, res) => {
  try {
    const { search, is_active } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { company_name: { [Op.iLike]: `%${search}%` } },
        { contact_person: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const clients = await Client.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

// Create client
exports.createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.update(req.body);
    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

// Delete client (soft delete)
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.update({ is_active: false });
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
};

// Get client's projects
exports.getClientProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { client_id: req.params.id },
      order: [['created_at', 'DESC']]
    });

    res.json(projects);
  } catch (error) {
    console.error('Get client projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};
