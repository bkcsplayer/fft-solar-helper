-- 系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- 创建索引
CREATE INDEX idx_settings_key ON system_settings(setting_key);

-- 插入初始设置
INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES 
  ('custom_domain', NULL, '自定义域名'),
  ('domain_verified', 'false', '域名验证状态'),
  ('server_ip', NULL, '服务器IP地址')
ON CONFLICT (setting_key) DO NOTHING;

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_update_timestamp
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION update_settings_timestamp();
