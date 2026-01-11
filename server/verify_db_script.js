const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false
    }
);

async function verify() {
    try {
        console.log('1. Testing Connection...');
        await sequelize.authenticate();
        console.log('SUCCESS: Connected to DB!');

        console.log('2. Checking Tables...');
        const tables = await sequelize.getQueryInterface().showAllSchemas();
        const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public';");
        const tableNames = results.map(r => r.table_name);
        console.log('Tables found:', tableNames);

        if (!tableNames.includes('users')) {
            console.error('CRITICAL: "users" table MISSING!');
        } else {
            console.log('3. Checking Admin User...');
            const [users] = await sequelize.query("SELECT * FROM users WHERE username='admin'");
            console.log('Admin user found:', users.length > 0 ? 'YES' : 'NO');
        }

        process.exit(0);
    } catch (error) {
        console.error('FAILURE:', error.message);
        process.exit(1);
    }
}

verify();
