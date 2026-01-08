-- FFT Solar CRM Database Schema Updates
-- New features: inspection status, project files, system settings

-- 1. Add inspection status to project_progress
ALTER TABLE project_progress
ADD COLUMN IF NOT EXISTS inspection_status VARCHAR(20) DEFAULT 'waiting'
CHECK (inspection_status IN ('pass', 'fail', 'waiting'));

ALTER TABLE project_progress
ADD COLUMN IF NOT EXISTS inspection_fail_reason TEXT;

-- 2. Add project photos and documents table
DROP TABLE IF EXISTS project_files CASCADE;

CREATE TABLE project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('photo', 'document')),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_project_files_type ON project_files(file_type);

-- 3. Add system settings table
DROP TABLE IF EXISTS system_settings CASCADE;

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'text' CHECK (setting_type IN ('text', 'number', 'boolean', 'json')),
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, setting_type) VALUES
('telegram_token', '', 'text'),
('smtp_host', '', 'text'),
('smtp_port', '587', 'number'),
('smtp_user', '', 'text'),
('smtp_password', '', 'text'),
('smtp_from_name', 'FFT Solar CRM', 'text'),
('smtp_from_email', 'noreply@fftsolar.com', 'text'),
('company_name', 'FFT Solar Installation Company', 'text'),
('company_address', '', 'text'),
('company_phone', '', 'text'),
('company_email', '', 'text');

-- 4. Add phone field to users table for admin profile
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- 5. Create index for updated_at in users for tracking admin changes
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
