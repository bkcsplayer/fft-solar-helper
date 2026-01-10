-- Add pricing model fields to clients table
-- price_model: 'per_watt' (default) or 'per_panel'
-- rate_per_panel: decimal value for per_panel pricing

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS price_model VARCHAR(20) DEFAULT 'per_watt' CHECK (price_model IN ('per_watt', 'per_panel')),
ADD COLUMN IF NOT EXISTS rate_per_panel DECIMAL(10, 2);

-- Make rate_per_watt nullable as it's not required for per_panel model
ALTER TABLE clients
ALTER COLUMN rate_per_watt DROP NOT NULL;
