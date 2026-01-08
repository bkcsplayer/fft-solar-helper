const { Asset, Staff } = require('../models');
const { Op } = require('sequelize');

// Get all assets
exports.getAssets = async (req, res) => {
  try {
    const { asset_type, status, search } = req.query;

    const where = {};
    if (asset_type) {
      where.asset_type = asset_type;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const assets = await Asset.findAll({
      where,
      include: [
        { model: Staff, as: 'current_holder', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

// Create asset
exports.createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);

    const assetWithHolder = await Asset.findByPk(asset.id, {
      include: [{ model: Staff, as: 'current_holder', attributes: ['id', 'name', 'phone'] }]
    });

    res.status(201).json(assetWithHolder);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
};

// Get asset by ID
exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [{ model: Staff, as: 'current_holder', attributes: ['id', 'name', 'phone'] }]
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
};

// Update asset
exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    await asset.update(req.body);

    const updatedAsset = await Asset.findByPk(req.params.id, {
      include: [{ model: Staff, as: 'current_holder', attributes: ['id', 'name', 'phone'] }]
    });

    res.json(updatedAsset);
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
};

// Delete asset
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    await asset.destroy();
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
};
