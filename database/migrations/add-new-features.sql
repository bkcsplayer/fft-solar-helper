-- ================================================
-- Database Migration: Add New Features
-- Date: 2026-01-06
-- ================================================

-- 1. Add inspection fields to project_progress table
ALTER TABLE project_progress 
ADD COLUMN inspection_status VARCHAR(30) CHECK (inspection_status IN ('pass', 'fail', 'waiting_for_inspection')),
ADD COLUMN inspection_date TIMESTAMP,
ADD COLUMN inspection_fail_reason TEXT,
ADD COLUMN inspection_notes TEXT;

-- 2. Create project_files table for photos and documents
CREATE TABLE IF NOT EXISTS project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'photo' or 'document'
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Create index for better query performance
CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_project_files_type ON project_files(file_type);

-- Update existing progress records to have default inspection status
UPDATE project_progress 
SET inspection_status = 'waiting_for_inspection' 
WHERE is_completed = true AND inspection_status IS NULL;

COMMENT ON TABLE project_files IS 'Stores photos and documents for projects';
COMMENT ON COLUMN project_progress.inspection_status IS 'Inspection status: pass, fail, or waiting_for_inspection';
COMMENT ON COLUMN project_progress.inspection_fail_reason IS 'Reason for inspection failure';

