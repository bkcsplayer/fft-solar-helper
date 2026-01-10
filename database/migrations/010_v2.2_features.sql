-- v2.2 Feature Migration: Project Logs & Insurance Workflow

-- 1. Create Project Logs Table
CREATE TABLE IF NOT EXISTS project_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    log_type VARCHAR(20) DEFAULT 'note' CHECK (log_type IN ('note', 'status_change', 'system')),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add Project Type and Removal Date to Projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_type VARCHAR(20) DEFAULT 'standard' CHECK (project_type IN ('standard', 'insurance')),
ADD COLUMN IF NOT EXISTS removal_date DATE;

-- 3. Add Phase to Project Assignments
ALTER TABLE project_assignments
ADD COLUMN IF NOT EXISTS phase VARCHAR(20) DEFAULT 'standard' CHECK (phase IN ('standard', 'removal', 'installation'));

-- Create index for logs
CREATE INDEX IF NOT EXISTS idx_project_logs_project_id ON project_logs(project_id);
