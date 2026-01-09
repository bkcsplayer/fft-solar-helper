const { SystemSettings, User } = require('../models');
const bcrypt = require('bcryptjs');

// Get all settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findAll({
      attributes: ['id', 'setting_key', 'setting_value', 'setting_type', 'updated_at']
    });

    // Convert array to object for easier frontend use
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = {
        value: setting.setting_value,
        type: setting.setting_type,
        updated_at: setting.updated_at
      };
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body; // { setting_key: value, ... }
    const userId = req.user.id;

    const results = [];

    for (const [key, value] of Object.entries(updates)) {
      const [setting, created] = await SystemSettings.findOrCreate({
        where: { setting_key: key },
        defaults: {
          setting_value: value,
          updated_by: userId
        }
      });

      if (!created) {
        await setting.update({
          setting_value: value,
          updated_by: userId,
          updated_at: new Date()
        });
      }

      results.push({ key, value, status: created ? 'created' : 'updated' });
    }

    res.json({
      message: 'Settings updated successfully',
      results
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' })
  }
};

// Test SMTP configuration
exports.testSMTP = async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_user, smtp_password, smtp_from, test_email } = req.body;

    if (!smtp_host || !smtp_port || !smtp_user || !smtp_password) {
      return res.status(400).json({ error: 'Missing required SMTP configuration' });
    }

    if (!test_email) {
      return res.status(400).json({ error: 'Please provide a test email address' });
    }

    const { testSMTPConnection } = require('../utils/testEmail');

    const result = await testSMTPConnection({
      host: smtp_host,
      port: smtp_port,
      user: smtp_user,
      password: smtp_password,
      from: smtp_from || smtp_user
    }, test_email);

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Test SMTP error:', error);
    res.status(500).json({ error: 'Failed to test SMTP configuration' });
  }
};

// Get admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'name', 'email', 'phone', 'created_at', 'updated_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update admin profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, current_password, new_password } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update basic info
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;

    // Update password if provided
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(new_password, salt);
    }

    user.updated_at = new Date();
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
