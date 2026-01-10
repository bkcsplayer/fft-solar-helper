-- FFT Solar CRM v2.1 Database Fix
-- Run this script to fix "Manual Record" and "Monthly Fixed Expenses" errors

-- 1. Create recurring_expenses table (Missing in previous versions)
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'yearly', 'weekly')),
    is_active BOOLEAN DEFAULT true,
    start_date DATE NOT NULL,
    end_date DATE,
    last_processed_date DATE,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add missing columns to finance_records table
ALTER TABLE finance_records 
ADD COLUMN IF NOT EXISTS vehicle_id INTEGER REFERENCES vehicles(id),
ADD COLUMN IF NOT EXISTS recurring_expense_id INTEGER REFERENCES recurring_expenses(id),
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- 3. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_active ON recurring_expenses(is_active);
CREATE INDEX IF NOT EXISTS idx_finance_records_vehicle ON finance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_finance_records_recurring ON finance_records(recurring_expense_id);
