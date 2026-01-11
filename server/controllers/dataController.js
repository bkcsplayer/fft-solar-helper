const {
    Project,
    Client,
    Staff,
    Vehicle,
    Asset,
    FinanceRecord,
    ProjectInverter,
    ProjectAssignment,
    ProjectProgress,
    sequelize
} = require('../models');

// Map URL slugs to Model classes
const modelMap = {
    'projects': Project,
    'clients': Client,
    'staff': Staff,
    'vehicles': Vehicle,
    'assets': Asset,
    'finance': FinanceRecord
};

// Export data for a specific model
exports.exportModel = async (req, res) => {
    try {
        const { modelName } = req.params;
        const Model = modelMap[modelName];

        if (!Model) {
            return res.status(400).json({ error: 'Invalid model name' });
        }

        const data = await Model.findAll();

        res.json({
            model: modelName,
            count: data.length,
            exportedAt: new Date(),
            data
        });
    } catch (error) {
        console.error(`Export ${req.params.modelName} error:`, error);
        res.status(500).json({ error: 'Failed to export data' });
    }
};

// Import data for a specific model
exports.importModel = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { modelName } = req.params;
        const { data } = req.body;
        const Model = modelMap[modelName];

        if (!Model) {
            await t.rollback();
            return res.status(400).json({ error: 'Invalid model name' });
        }

        if (!Array.isArray(data)) {
            await t.rollback();
            return res.status(400).json({ error: 'Invalid data format. Expected an array of records.' });
        }

        let createdCount = 0;
        let updatedCount = 0;

        for (const record of data) {
            // Remove checks that might block import (like internal fields if necessary)
            // Ideally we keep IDs to maintain relationships

            // Check if record exists
            const existing = record.id ? await Model.findByPk(record.id, { transaction: t }) : null;

            if (existing) {
                await existing.update(record, { transaction: t });
                updatedCount++;
            } else {
                await Model.create(record, { transaction: t });
                createdCount++;
            }
        }

        await t.commit();

        res.json({
            message: 'Import successful',
            stats: {
                total: data.length,
                created: createdCount,
                updated: updatedCount
            }
        });
    } catch (error) {
        await t.rollback();
        console.error(`Import ${req.params.modelName} error:`, error);
        res.status(500).json({ error: 'Failed to import data: ' + error.message });
    }
};
