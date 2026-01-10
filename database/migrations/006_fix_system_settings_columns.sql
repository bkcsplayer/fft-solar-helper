-- FFT Solar CRM v2.1 Database Fix - System Settings Columns
-- Run this script to fix "Failed to update system settings" error (Missing Columns)

-- Add setting_type column if it doesn't exist
ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS setting_type VARCHAR(50) DEFAULT 'text';

-- Add description column if it doesn't exist
ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add updated_by column if it doesn't exist
ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS updated_by INTEGER;

-- Ensure constraints (optional, but good for consistency)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'system_settings_updated_by_fkey') THEN
        ALTER TABLE system_settings
        ADD CONSTRAINT system_settings_updated_by_fkey
        FOREIGN KEY (updated_by) REFERENCES users(id);
    END IF;
END $$;
