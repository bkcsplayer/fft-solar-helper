-- Update existing project assignments to set paid_amount = calculated_pay
-- Only for records where paid_amount is 0 or NULL

UPDATE project_assignments 
SET paid_amount = calculated_pay
WHERE paid_amount = 0 OR paid_amount IS NULL;
