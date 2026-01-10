-- Add installation_date to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS installation_date DATE;
