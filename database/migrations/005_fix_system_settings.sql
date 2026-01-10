-- FFT Solar CRM v2.1 Database Fix - System Settings
-- Run this script to fix "Failed to update system settings" error

-- 1. Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'text' CHECK (setting_type IN ('text', 'number', 'boolean', 'json')),
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert default settings (safe insert using ON CONFLICT)
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
('company_email', '', 'text')
ON CONFLICT (setting_key) DO NOTHING;
