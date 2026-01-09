-- 添加已付薪资字段到project_assignments表
ALTER TABLE project_assignments 
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(10, 2) DEFAULT 0.00;

-- 添加支付备注字段
ALTER TABLE project_assignments 
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- 添加最后支付时间字段
ALTER TABLE project_assignments 
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP;

-- 添加字段说明
COMMENT ON COLUMN project_assignments.paid_amount IS '已付薪资金额';
COMMENT ON COLUMN project_assignments.payment_notes IS '支付备注';
COMMENT ON COLUMN project_assignments.last_payment_date IS '最后支付时间';
