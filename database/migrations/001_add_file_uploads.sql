-- Migration: Add File Uploads and Maintenance Logs
-- Date: 2026-01-06

-- 1. Add project_files column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_files TEXT;
COMMENT ON COLUMN projects.project_files IS 'JSON array of uploaded file metadata';

-- 2. Add vehicle_documents column to vehicles table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_documents TEXT;
COMMENT ON COLUMN vehicles.vehicle_documents IS 'JSON array of uploaded document metadata';

-- 3. Create vehicle_maintenance_logs table
CREATE TABLE IF NOT EXISTS vehicle_maintenance_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2) DEFAULT 0,
    mileage INTEGER,
    performed_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_logs_vehicle_id ON vehicle_maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_logs_date ON vehicle_maintenance_logs(maintenance_date);

-- 4. Create system_settings table if not exists
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('openrouter_api_key', '', 'string', 'OpenRouter API Key for AI services'),
('openrouter_api_url', 'https://openrouter.ai/api/v1', 'string', 'OpenRouter API Base URL'),
('telegram_token', '', 'string', 'Telegram Bot Token for notifications'),
('smtp_host', '', 'string', 'SMTP server host'),
('smtp_port', '587', 'number', 'SMTP server port'),
('smtp_user', '', 'string', 'SMTP username/email'),
('smtp_password', '', 'password', 'SMTP password'),
('smtp_from_name', 'FFT Solar CRM', 'string', 'Email sender name'),
('smtp_from_email', 'noreply@fftsolar.com', 'string', 'Email sender address'),
('company_name', 'FFT Solar Installation Company', 'string', 'Company name'),
('company_address', '', 'string', 'Company address'),
('company_phone', '', 'string', 'Company phone number'),
('company_email', '', 'string', 'Company email address')
ON CONFLICT (setting_key) DO NOTHING;

-- 6. Add phone field to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
