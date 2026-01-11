-- FFT Solar CRM Database Schema
-- PostgreSQL Database

-- Drop tables if exist (for development)
DROP TABLE IF EXISTS project_progress CASCADE;
DROP TABLE IF EXISTS project_assignments CASCADE;
DROP TABLE IF EXISTS project_inverters CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS vehicle_maintenance CASCADE;
DROP TABLE IF EXISTS vehicle_usage CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS finance_records CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table - Admin Login
-- 1. Users Table - Admin Login
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients Table - 甲方公司 (Updated v2.3)
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    price_model VARCHAR(20) DEFAULT 'per_watt' CHECK (price_model IN ('per_watt', 'per_panel')),
    rate_per_watt DECIMAL(10, 4),
    rate_per_panel DECIMAL(10, 2),
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Staff Table - 员工
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('leader', 'installer', 'electrician')),
    phone VARCHAR(50),
    email VARCHAR(100),
    pay_type VARCHAR(20) NOT NULL CHECK (pay_type IN ('per_panel', 'per_project')),
    pay_rate DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Projects Table - 项目 (Updated v2.3)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    address VARCHAR(500) NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    customer_name VARCHAR(100),
    customer_phone VARCHAR(50),

    -- Panel Information
    panel_brand VARCHAR(100),
    panel_watt INTEGER,
    panel_quantity INTEGER,
    total_watt INTEGER GENERATED ALWAYS AS (panel_watt * panel_quantity) STORED,

    -- Status & Dates
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    installation_date DATE,
    completion_date DATE,

    -- Financial
    project_revenue DECIMAL(10, 2),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Project Inverters Table - 项目逆变器
CREATE TABLE project_inverters (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    inverter_type VARCHAR(20) NOT NULL CHECK (inverter_type IN ('hybrid', 'micro')),
    brand VARCHAR(100),
    model VARCHAR(100),
    watt_per_unit INTEGER,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Project Assignments Table - 项目人员分配
CREATE TABLE project_assignments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    staff_id INTEGER REFERENCES staff(id),
    role_in_project VARCHAR(20) NOT NULL CHECK (role_in_project IN ('leader', 'installer', 'electrician')),
    calculated_pay DECIMAL(10, 2),
    manual_pay DECIMAL(10, 2),
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMP,
    is_notified BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Project Progress Table - 施工进度
CREATE TABLE project_progress (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    stage VARCHAR(30) NOT NULL CHECK (stage IN ('removal', 'roof_base', 'electrical', 'roof_install', 'bird_net')),
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    completed_by INTEGER REFERENCES users(id),
    inspection_status VARCHAR(30) DEFAULT 'waiting' CHECK (inspection_status IN ('waiting', 'pass', 'fail')),
    inspection_date DATE,
    inspection_fail_reason TEXT,
    inspection_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Project Files Table (New v2.0)
CREATE TABLE project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    category VARCHAR(50) DEFAULT 'document',
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Vehicles Table - 车辆 (Updated)
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(100),
    current_mileage INTEGER DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Vehicle Usage Table - 车辆使用记录
CREATE TABLE vehicle_usage (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id),
    staff_id INTEGER REFERENCES staff(id),
    usage_date DATE NOT NULL,
    start_mileage INTEGER NOT NULL,
    end_mileage INTEGER NOT NULL,
    distance INTEGER GENERATED ALWAYS AS (end_mileage - start_mileage) STORED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Vehicle Maintenance Table - 车辆维护记录
CREATE TABLE vehicle_maintenance (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    cost DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Vehicle Maintenance Logs (New v2.0)
CREATE TABLE vehicle_maintenance_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Assets Table - 资产设备
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance')),
    current_holder_id INTEGER REFERENCES staff(id),
    purchase_date DATE,
    purchase_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Recurring Expenses Table (New v2.2)
CREATE TABLE recurring_expenses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'yearly', 'weekly')),
    start_date DATE NOT NULL,
    next_due_date DATE,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Finance Records Table - 财务记录 (Updated v2.2)
CREATE TABLE finance_records (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL,
    record_type VARCHAR(10) NOT NULL CHECK (record_type IN ('income', 'expense')),
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    project_id INTEGER REFERENCES projects(id),
    staff_id INTEGER REFERENCES staff(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    recurring_expense_id INTEGER REFERENCES recurring_expenses(id),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. System Settings Table (New v2.1)
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    value TEXT,
    description TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, key_name)
);

-- Create Indexes
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_finance_records_date ON finance_records(record_date);
CREATE INDEX idx_finance_records_project ON finance_records(project_id);

-- Insert Default Admin User
INSERT INTO users (username, password_hash, name, email)
VALUES ('admin', '$2a$10$UNcukqejRu/DN1ERKE7iV.IMdk0v7rbtQh6jjRC6bRSqVcWvhTFBS', 'Administrator', 'admin@fftsolar.com');

-- Sample Client Data (Updated)
INSERT INTO clients (company_name, contact_person, phone, email, price_model, rate_per_watt) VALUES
('SunPower Corp', 'John Smith', '416-123-4567', 'john@sunpower.com', 'per_watt', 0.50),
('Canadian Solar Inc', 'Jane Doe', '647-234-5678', 'jane@canadiansolar.com', 'per_watt', 0.48);

INSERT INTO staff (name, role, phone, email, pay_type, pay_rate) VALUES
('张三', 'electrician', '416-111-1111', 'zhangsan@email.com', 'per_project', 150.00),
('李四', 'leader', '416-222-2222', 'lisi@email.com', 'per_panel', 18.00),
('王五', 'installer', '416-333-3333', 'wangwu@email.com', 'per_panel', 15.00),
('赵六', 'installer', '416-444-4444', 'zhaoliu@email.com', 'per_panel', 12.00);
