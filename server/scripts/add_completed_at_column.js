const { sequelize, Project } = require('../models');

async function migrate() {
    const transaction = await sequelize.transaction();
    try {
        console.log('Starting migration: Adding completed_at to projects table...');

        // 1. Add column if it doesn't exist
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('projects');

        if (!tableInfo.completed_at) {
            await queryInterface.addColumn('projects', 'completed_at', {
                type: 'TIMESTAMP WITH TIME ZONE',
                allowNull: true
            }, { transaction });
            console.log('Added completed_at column.');
        } else {
            console.log('completed_at column already exists.');
        }

        // 2. Backfill data for completed projects
        const completedProjects = await Project.findAll({
            where: {
                status: 'completed',
                completed_at: null
            },
            transaction
        });

        console.log(`Found ${completedProjects.length} completed projects to backfill.`);

        for (const project of completedProjects) {
            // Use updated_at as the best guess for completion time for existing records
            // In a real scenario, we might want to check logs, but this is a reasonable default for now
            await project.update({
                completed_at: project.updated_at
            }, { transaction });
        }

        await transaction.commit();
        console.log('Migration completed successfully.');
    } catch (error) {
        await transaction.rollback();
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

migrate();
