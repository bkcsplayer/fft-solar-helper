/**
 * FFT Solar CRM - Database Migration Script
 * Automatically adds missing columns to existing tables
 * Run: node database/migrate.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'fft_solar_crm',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

const migrations = [
    // Projects table
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_files TEXT`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS siteplan_file VARCHAR(500)`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS bom_file VARCHAR(500)`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type VARCHAR(20) DEFAULT 'standard'`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS removal_date DATE`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP`,

    // Project Assignments table
    `ALTER TABLE project_assignments ADD COLUMN IF NOT EXISTS phase VARCHAR(20) DEFAULT 'standard'`,
    `ALTER TABLE project_assignments ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0`,
    `ALTER TABLE project_assignments ADD COLUMN IF NOT EXISTS payment_notes TEXT`,
    `ALTER TABLE project_assignments ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP`,

    // Project Files table
    `ALTER TABLE project_files ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100)`,
    `ALTER TABLE project_files ADD COLUMN IF NOT EXISTS notes TEXT`,
    `ALTER TABLE project_files ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    // Project Logs table (create if not exists)
    `CREATE TABLE IF NOT EXISTS project_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    log_type VARCHAR(20) DEFAULT 'note',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

    // Vehicles table
    `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_documents TEXT`,

    // Finance Records table
    `ALTER TABLE finance_records ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false`,

    // Recurring Expenses table
    `ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS end_date DATE`,
    `ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS last_processed_date DATE`,
    `ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS notes TEXT`,

    // Project Progress table
    `ALTER TABLE project_progress ADD COLUMN IF NOT EXISTS inspection_status VARCHAR(30) DEFAULT 'waiting'`,
    `ALTER TABLE project_progress ADD COLUMN IF NOT EXISTS inspection_date DATE`,
    `ALTER TABLE project_progress ADD COLUMN IF NOT EXISTS inspection_fail_reason TEXT`,
    `ALTER TABLE project_progress ADD COLUMN IF NOT EXISTS inspection_notes TEXT`,
];

async function runMigrations() {
    console.log('Starting database migrations...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const migration of migrations) {
        try {
            await pool.query(migration);
            const shortDesc = migration.split('\n')[0].substring(0, 60);
            console.log(`✓ ${shortDesc}...`);
            successCount++;
        } catch (error) {
            console.log(`✗ Error: ${error.message}`);
            errorCount++;
        }
    }

    console.log('\n================================');
    console.log(`Migrations complete: ${successCount} success, ${errorCount} errors`);
    console.log('================================\n');

    await pool.end();
    process.exit(errorCount > 0 ? 1 : 0);
}

runMigrations().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
