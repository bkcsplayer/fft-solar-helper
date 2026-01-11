const { Project } = require('../models');

async function inspectProjects() {
    try {
        const projects = await Project.findAll({
            where: {
                status: 'completed'
            },
            attributes: ['id', 'address', 'status', 'updated_at', 'completed_at']
        });

        console.log('--- Completed Projects Inspection ---');
        projects.forEach(p => {
            console.log(`ID: ${p.id}`);
            console.log(`Address: ${p.address}`);
            console.log(`Status: ${p.status}`);
            console.log(`Updated At: ${p.updated_at}`);
            console.log(`Completed At: ${p.completed_at}`);
            console.log('-----------------------------------');
        });

    } catch (error) {
        console.error('Inspection failed:', error);
    }
}

inspectProjects();
