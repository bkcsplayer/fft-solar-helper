-- ================================================
-- FFT Solar CRM - Complete Mock Data (English Version)
-- ================================================
-- Compatible with schema.sql - No Chinese characters to avoid encoding issues
-- ================================================

-- Clear existing data (preserve table structure, reset ID sequences)
TRUNCATE TABLE finance_records, vehicle_maintenance, vehicle_usage, 
               project_progress, project_assignments, project_inverters, 
               projects, vehicles, assets, staff, clients, users 
               RESTART IDENTITY CASCADE;

-- ================================================
-- 1. Users Table - Admin Accounts
-- ================================================
-- Password: admin123
INSERT INTO users (username, password_hash, name, email, is_active) VALUES
('admin', '$2a$10$UNcukqejRu/DN1ERKE7iV.IMdk0v7rbtQh6jjRC6bRSqVcWvhTFBS', 'System Admin', 'admin@fftsolar.com', true),
('manager', '$2a$10$UNcukqejRu/DN1ERKE7iV.IMdk0v7rbtQh6jjRC6bRSqVcWvhTFBS', 'Project Manager', 'manager@fftsolar.com', true);

-- ================================================
-- 2. Clients Table - Customer Companies
-- ================================================
INSERT INTO clients (company_name, contact_person, phone, email, rate_per_watt, address, notes, is_active) VALUES
-- Large clients
('SunPower Solutions Inc.', 'John Smith', '416-555-0101', 'john.smith@sunpower.com', 0.52, '123 Solar Street, Toronto, ON M5H 2N2', 'Long-term partner, priority handling', true),
('Canadian Solar Energy Corp', 'Sarah Johnson', '647-555-0202', 'sarah.j@cansolar.ca', 0.48, '456 Green Avenue, Mississauga, ON L5B 1M2', 'Commercial project specialist', true),
('EcoEnergy Partners Ltd.', 'Michael Chen', '905-555-0303', 'michael@ecoenergy.ca', 0.50, '789 Renewable Road, Markham, ON L3R 5K4', 'Industrial projects priority', true),
-- Medium clients
('GreenTech Installations', 'Emily Davis', '416-555-0404', 'emily@greentech.com', 0.45, '321 Clean Energy Blvd, North York, ON M2N 6K1', 'Residential project specialist', true),
('Bright Future Solar', 'David Lee', '647-555-0505', 'david@brightfuture.ca', 0.47, '654 Sunshine Lane, Scarborough, ON M1P 4P5', 'Growing client, high potential', true),
-- Small clients
('Community Solar Co-op', 'Lisa Wang', '905-555-0606', 'lisa@communitysolar.ca', 0.43, '987 Local Drive, Richmond Hill, ON L4C 9V6', 'Community projects', true),
('Residential Green Inc.', 'Robert Brown', '416-555-0707', 'robert@resgreen.com', 0.44, '147 Home Street, Etobicoke, ON M9C 1B9', 'Small residential projects', true),
-- Inactive client
('Old Energy Partners', 'James Wilson', '647-555-0808', 'james@oldenergy.com', 0.40, '258 Past Road, Ajax, ON L1S 7K8', 'Partnership paused, pending renewal', false);

-- ================================================
-- 3. Staff Table - Installation Team
-- ================================================
INSERT INTO staff (name, role, pay_type, pay_rate, phone, email, is_active) VALUES
-- Electricians - Per Project Pay
('Tom Zhang', 'electrician', 'per_project', 180.00, '416-555-1001', 'tom.zhang@fftsolar.com', true),
('Kevin Li', 'electrician', 'per_project', 175.00, '647-555-1002', 'kevin.li@fftsolar.com', true),
('Mike Wang', 'electrician', 'per_project', 170.00, '905-555-1003', 'mike.wang@fftsolar.com', true),
-- Team Leaders - Per Panel Pay
('Jason Lee', 'leader', 'per_panel', 18.00, '416-555-2001', 'jason.lee@fftsolar.com', true),
('Amy Zhao', 'leader', 'per_panel', 17.50, '647-555-2002', 'amy.zhao@fftsolar.com', true),
('Jack Sun', 'leader', 'per_panel', 17.00, '905-555-2003', 'jack.sun@fftsolar.com', true),
-- Installers - Per Panel Pay
('Peter Wu', 'installer', 'per_panel', 15.00, '416-555-3001', 'peter.wu@fftsolar.com', true),
('David Liu', 'installer', 'per_panel', 14.50, '647-555-3002', 'david.liu@fftsolar.com', true),
('Chris Qian', 'installer', 'per_panel', 14.00, '905-555-3003', 'chris.qian@fftsolar.com', true),
('Ryan Sun', 'installer', 'per_panel', 13.50, '416-555-3004', 'ryan.sun@fftsolar.com', true),
('Tony Zhou', 'installer', 'per_panel', 13.00, '647-555-3005', 'tony.zhou@fftsolar.com', true),
('Eric Wu', 'installer', 'per_panel', 12.50, '905-555-3006', 'eric.wu@fftsolar.com', true),
-- Junior Installers
('Andy Liu', 'installer', 'per_panel', 12.00, '416-555-3007', 'andy.liu@fftsolar.com', true),
('Steve Chen', 'installer', 'per_panel', 11.50, '647-555-3008', 'steve.chen@fftsolar.com', true),
-- Former Employee
('Mark Ma', 'installer', 'per_panel', 15.00, '905-555-3009', 'mark.ma@fftsolar.com', false);

-- ================================================
-- 4. Projects Table - Solar Installation Projects
-- ================================================
INSERT INTO projects (client_id, address, customer_name, customer_phone, panel_brand, panel_watt, panel_quantity, siteplan_file, bom_file, status, notes) VALUES
-- Completed Projects (November)
(1, '1234 Residential Ave, Toronto, ON M4B 1B3', 'Tom Wilson', '416-111-0001', 'Canadian Solar', 400, 28, '/uploads/siteplan_001.pdf', '/uploads/bom_001.pdf', 'completed', 'Residential project, good roof condition, smooth installation'),
(2, '5678 Commerce Road, Mississauga, ON L5B 3Y4', 'ABC Corporation', '647-111-0002', 'Trina Solar', 450, 45, '/uploads/siteplan_002.pdf', '/uploads/bom_002.pdf', 'completed', 'Commercial building, needed extra brackets, customer very satisfied'),
(3, '9012 Industrial Blvd, Markham, ON L3R 9Y5', 'Industrial Tech Inc', '905-111-0003', 'JinkoSolar', 440, 60, '/uploads/siteplan_003.pdf', '/uploads/bom_003.pdf', 'completed', 'Industrial warehouse, large project, completed in two phases'),
-- Completed Projects (December)
(4, '3456 Family Home Cres, North York, ON M2N 5X8', 'Zhang Family', '416-111-0004', 'LONGi Solar', 450, 32, '/uploads/siteplan_004.pdf', '/uploads/bom_004.pdf', 'completed', 'Residential project, customer requested high-efficiency panels'),
(5, '7890 Green Business Park, Scarborough, ON M1P 4P7', 'Green Office Ltd', '647-111-0005', 'Canadian Solar', 400, 50, '/uploads/siteplan_005.pdf', '/uploads/bom_005.pdf', 'completed', 'Business park, multiple roof surfaces'),
(1, '2468 Suburban Lane, Richmond Hill, ON L4C 6T3', 'Li Residence', '905-111-0006', 'Trina Solar', 450, 38, '/uploads/siteplan_006.pdf', '/uploads/bom_006.pdf', 'completed', 'Residential project, needed tree branch clearing'),
-- In Progress Projects
(6, '1357 Community Center Dr, Etobicoke, ON M9C 2E5', 'Community Center', '416-111-0007', 'JinkoSolar', 440, 42, '/uploads/siteplan_007.pdf', '/uploads/bom_007.pdf', 'in_progress', 'Community center project, need to coordinate usage times'),
(7, '8024 New Development St, Ajax, ON L1S 7M9', 'New Home Builder', '647-111-0008', 'Canadian Solar', 400, 55, '/uploads/siteplan_008.pdf', '/uploads/bom_008.pdf', 'in_progress', 'New construction, standard roof structure'),
(2, '9753 Corporate Plaza, Mississauga, ON L5B 1M6', 'Tech Corp HQ', '905-111-0009', 'LONGi Solar', 450, 48, '/uploads/siteplan_009.pdf', '/uploads/bom_009.pdf', 'in_progress', 'Office building project, weekend work required'),
-- Pending Projects
(3, '1593 Future Energy Ave, Markham, ON L3R 0P7', 'Wang Residence', '416-111-0010', 'Trina Solar', 450, 35, NULL, NULL, 'pending', 'Residential project, customer wants to start early January'),
(5, '7531 Eco Complex, Scarborough, ON M1P 2R4', 'Eco Business Center', '647-111-0011', 'JinkoSolar', 440, 52, NULL, NULL, 'pending', 'Commercial complex, needs detailed planning'),
(4, '3698 Residential Complex, North York, ON M2N 7H2', 'Condo Association', '905-111-0012', 'Canadian Solar', 400, 40, NULL, NULL, 'pending', 'Condo building project, needs property management coordination');

-- ================================================
-- 5. Project Inverters Table - Inverter Configuration
-- ================================================
INSERT INTO project_inverters (project_id, inverter_type, brand, model, watt_per_unit, quantity) VALUES
-- Project 1 Inverters
(1, 'hybrid', 'SolarEdge', 'SE10000H-US', 10000, 1),
(1, 'micro', 'Enphase', 'IQ7PLUS-72-2-US', 290, 2),
-- Project 2 Inverters
(2, 'hybrid', 'Fronius', 'Primo GEN24 6.0 Plus', 15000, 1),
(2, 'micro', 'Enphase', 'IQ8PLUS-72-2-US', 300, 3),
-- Project 3 Inverters
(3, 'hybrid', 'SMA', 'Sunny Boy 7.7-US', 20000, 1),
(3, 'hybrid', 'Fronius', 'Primo GEN24 6.0 Plus', 15000, 1),
-- Project 4 Inverters
(4, 'hybrid', 'SolarEdge', 'SE10000H-US', 12000, 1),
(4, 'micro', 'Enphase', 'IQ7PLUS-72-2-US', 290, 2),
-- Project 5 Inverters
(5, 'hybrid', 'Fronius', 'Primo GEN24 6.0 Plus', 18000, 1),
-- Project 6 Inverters
(6, 'hybrid', 'SolarEdge', 'SE10000H-US', 15000, 1),
(6, 'micro', 'Enphase', 'IQ8PLUS-72-2-US', 300, 2),
-- Project 7 Inverters
(7, 'hybrid', 'SMA', 'Sunny Boy 7.7-US', 12000, 1),
-- Project 8 Inverters
(8, 'hybrid', 'Fronius', 'Primo GEN24 6.0 Plus', 18000, 1),
(8, 'micro', 'Enphase', 'IQ7PLUS-72-2-US', 290, 3),
-- Project 9 Inverters
(9, 'hybrid', 'SolarEdge', 'SE10000H-US', 16000, 1);

-- ================================================
-- 6. Project Assignments Table - Staff Assignments
-- ================================================
INSERT INTO project_assignments (project_id, staff_id, role_in_project, calculated_pay, is_notified) VALUES
-- Project 1 (28 panels) - Completed
(1, 1, 'electrician', 180.00, true),   -- Tom Zhang - Electrician
(1, 4, 'leader', 504.00, true),        -- Jason Lee - Leader 28 x $18
(1, 7, 'installer', 420.00, true),     -- Peter Wu - Installer 28 x $15
(1, 8, 'installer', 406.00, true),     -- David Liu - Installer 28 x $14.50

-- Project 2 (45 panels) - Completed
(2, 2, 'electrician', 175.00, true),   -- Kevin Li - Electrician
(2, 5, 'leader', 787.50, true),        -- Amy Zhao - Leader 45 x $17.50
(2, 9, 'installer', 630.00, true),     -- Chris Qian - Installer 45 x $14
(2, 10, 'installer', 607.50, true),    -- Ryan Sun - Installer 45 x $13.50
(2, 11, 'installer', 585.00, true),    -- Tony Zhou - Installer 45 x $13

-- Project 3 (60 panels) - Completed
(3, 3, 'electrician', 170.00, true),   -- Mike Wang - Electrician
(3, 1, 'electrician', 180.00, true),   -- Tom Zhang - Electrician (extra)
(3, 6, 'leader', 1020.00, true),       -- Jack Sun - Leader 60 x $17
(3, 7, 'installer', 900.00, true),     -- Peter Wu - Installer 60 x $15
(3, 8, 'installer', 870.00, true),     -- David Liu - Installer 60 x $14.50
(3, 9, 'installer', 840.00, true),     -- Chris Qian - Installer 60 x $14

-- Project 4 (32 panels) - Completed
(4, 2, 'electrician', 175.00, true),   -- Kevin Li - Electrician
(4, 4, 'leader', 576.00, true),        -- Jason Lee - Leader 32 x $18
(4, 10, 'installer', 432.00, true),    -- Ryan Sun - Installer 32 x $13.50
(4, 11, 'installer', 416.00, true),    -- Tony Zhou - Installer 32 x $13

-- Project 5 (50 panels) - Completed
(5, 1, 'electrician', 180.00, true),   -- Tom Zhang - Electrician
(5, 5, 'leader', 875.00, true),        -- Amy Zhao - Leader 50 x $17.50
(5, 7, 'installer', 750.00, true),     -- Peter Wu - Installer 50 x $15
(5, 12, 'installer', 625.00, true),    -- Eric Wu - Installer 50 x $12.50
(5, 13, 'installer', 600.00, true),    -- Andy Liu - Installer 50 x $12

-- Project 6 (38 panels) - Completed
(6, 3, 'electrician', 170.00, true),   -- Mike Wang - Electrician
(6, 6, 'leader', 646.00, true),        -- Jack Sun - Leader 38 x $17
(6, 8, 'installer', 551.00, true),     -- David Liu - Installer 38 x $14.50
(6, 14, 'installer', 437.00, true),    -- Steve Chen - Installer 38 x $11.50

-- Project 7 (42 panels) - In Progress
(7, 1, 'electrician', 180.00, true),   -- Tom Zhang - Electrician
(7, 4, 'leader', 756.00, true),        -- Jason Lee - Leader 42 x $18
(7, 9, 'installer', 588.00, true),     -- Chris Qian - Installer 42 x $14
(7, 10, 'installer', 567.00, true),    -- Ryan Sun - Installer 42 x $13.50

-- Project 8 (55 panels) - In Progress
(8, 2, 'electrician', 175.00, true),   -- Kevin Li - Electrician
(8, 5, 'leader', 962.50, true),        -- Amy Zhao - Leader 55 x $17.50
(8, 7, 'installer', 825.00, true),     -- Peter Wu - Installer 55 x $15
(8, 11, 'installer', 715.00, true),    -- Tony Zhou - Installer 55 x $13
(8, 12, 'installer', 687.50, true),    -- Eric Wu - Installer 55 x $12.50

-- Project 9 (48 panels) - In Progress
(9, 3, 'electrician', 170.00, true),   -- Mike Wang - Electrician
(9, 6, 'leader', 816.00, true),        -- Jack Sun - Leader 48 x $17
(9, 8, 'installer', 696.00, true),     -- David Liu - Installer 48 x $14.50
(9, 13, 'installer', 576.00, true);    -- Andy Liu - Installer 48 x $12

-- ================================================
-- 7. Project Progress Table - Construction Progress
-- ================================================
INSERT INTO project_progress (project_id, stage, is_completed, completed_by, completed_at) VALUES
-- Project 1 - All Complete
(1, 'roof_base', true, 1, '2024-11-02 14:30:00'),
(1, 'electrical', true, 1, '2024-11-03 16:45:00'),
(1, 'roof_install', true, 1, '2024-11-04 15:20:00'),
(1, 'bird_net', true, 1, '2024-11-05 11:00:00'),

-- Project 2 - All Complete
(2, 'roof_base', true, 1, '2024-11-10 10:15:00'),
(2, 'electrical', true, 1, '2024-11-12 14:30:00'),
(2, 'roof_install', true, 1, '2024-11-14 16:00:00'),
(2, 'bird_net', true, 1, '2024-11-15 10:30:00'),

-- Project 3 - All Complete
(3, 'roof_base', true, 1, '2024-11-13 09:00:00'),
(3, 'electrical', true, 1, '2024-11-16 15:30:00'),
(3, 'roof_install', true, 1, '2024-11-19 17:00:00'),
(3, 'bird_net', true, 1, '2024-11-20 12:00:00'),

-- Project 4 - All Complete
(4, 'roof_base', true, 1, '2024-12-03 13:00:00'),
(4, 'electrical', true, 1, '2024-12-05 15:30:00'),
(4, 'roof_install', true, 1, '2024-12-06 16:30:00'),
(4, 'bird_net', true, 1, '2024-12-07 10:00:00'),

-- Project 5 - All Complete
(5, 'roof_base', true, 1, '2024-12-06 14:00:00'),
(5, 'electrical', true, 1, '2024-12-09 16:00:00'),
(5, 'roof_install', true, 1, '2024-12-11 17:30:00'),
(5, 'bird_net', true, 1, '2024-12-12 11:30:00'),

-- Project 6 - All Complete
(6, 'roof_base', true, 1, '2024-12-11 10:00:00'),
(6, 'electrical', true, 1, '2024-12-13 14:00:00'),
(6, 'roof_install', true, 1, '2024-12-15 16:00:00'),
(6, 'bird_net', true, 1, '2024-12-16 10:00:00'),

-- Project 7 - In Progress (First 2 stages complete)
(7, 'roof_base', true, 1, '2024-12-20 13:30:00'),
(7, 'electrical', true, 1, '2024-12-23 15:00:00'),
(7, 'roof_install', false, NULL, NULL),
(7, 'bird_net', false, NULL, NULL),

-- Project 8 - In Progress (First stage complete)
(8, 'roof_base', true, 1, '2024-12-22 11:00:00'),
(8, 'electrical', false, NULL, NULL),
(8, 'roof_install', false, NULL, NULL),
(8, 'bird_net', false, NULL, NULL),

-- Project 9 - In Progress (First 3 stages complete)
(9, 'roof_base', true, 1, '2024-12-26 10:00:00'),
(9, 'electrical', true, 1, '2024-12-28 14:00:00'),
(9, 'roof_install', true, 1, '2024-12-30 16:30:00'),
(9, 'bird_net', false, NULL, NULL);

-- ================================================
-- 8. Vehicles Table - Company Vehicles
-- ================================================
INSERT INTO vehicles (plate_number, model, current_mileage, notes, is_active) VALUES
('ABCD 123', 'Ford F-150 2020', 45230, 'Main pickup truck for large projects', true),
('EFGH 456', 'Mercedes-Benz Sprinter 2021', 32450, 'Cargo van for equipment transport', true),
('IJKL 789', 'RAM 1500 2022', 18920, 'New pickup, good condition', true),
('MNOP 012', 'Ford Transit 2019', 62340, 'Older van, needs regular maintenance', true),
('QRST 345', 'Chevrolet Silverado 2023', 8750, 'Latest purchase, excellent performance', true),
('UVWX 678', 'RAM ProMaster 2020', 38920, 'Cargo van, spacious', true);

-- ================================================
-- 9. Vehicle Usage Records Table
-- ================================================
INSERT INTO vehicle_usage (vehicle_id, project_id, staff_id, usage_date, start_mileage, end_mileage, notes) VALUES
-- November Usage Records
(1, 1, 4, '2024-11-02', 44500, 44580, 'Project 1 equipment and material transport'),
(2, 2, 5, '2024-11-10', 31800, 31950, 'Project 2 multiple round trips'),
(3, 3, 6, '2024-11-13', 18200, 18420, 'Project 3 large equipment transport'),
-- December Usage Records
(4, 4, 4, '2024-12-03', 61500, 61610, 'Project 4 material transport'),
(5, 5, 5, '2024-12-06', 8300, 8480, 'Project 5 multiple trips'),
(1, 6, 6, '2024-12-11', 44580, 44690, 'Project 6 equipment transport'),
(2, 7, 4, '2024-12-20', 31950, 32100, 'Project 7 in progress'),
(3, 8, 5, '2024-12-22', 18420, 18590, 'Project 8 transport'),
(6, 9, 6, '2024-12-26', 38500, 38650, 'Project 9 transport'),
-- More December Records
(1, 7, 7, '2024-12-21', 44690, 44780, 'Project 7 material resupply'),
(4, 8, 8, '2024-12-24', 61610, 61720, 'Project 8 equipment transport'),
(5, 9, 9, '2024-12-28', 8480, 8580, 'Project 9 installation materials');

-- ================================================
-- 10. Vehicle Maintenance Records Table
-- ================================================
INSERT INTO vehicle_maintenance (vehicle_id, maintenance_date, maintenance_type, cost, notes) VALUES
-- Regular Maintenance
(1, '2024-11-15', 'Regular Service', 250.00, '45,000 km service - oil change, filter replacement'),
(2, '2024-11-20', 'Regular Service', 280.00, '30,000 km service - oil change, inspection'),
(4, '2024-12-05', 'Regular Service', 230.00, '60,000 km major service - oil change, tire check'),
-- Repairs
(1, '2024-11-22', 'Brake Repair', 420.00, 'Front brake pad replacement'),
(3, '2024-12-10', 'Battery Replacement', 180.00, 'Original battery aged, new battery installed'),
(5, '2024-12-15', 'Windshield Repair', 320.00, 'Crack repair from stone chip'),
-- Inspection
(6, '2024-12-20', 'Annual Inspection', 150.00, 'Passed annual safety inspection'),
(2, '2024-12-28', 'Tire Replacement', 680.00, 'Four winter tires replaced');

-- ================================================
-- 11. Assets Table - Tools and Equipment
-- ================================================
INSERT INTO assets (name, asset_type, status, current_holder_id, purchase_date, purchase_cost, notes) VALUES
-- Ladders
('32ft Extension Ladder Werner D6232-2', 'ladder', 'in_use', 4, '2020-05-10', 450.00, 'Regular inspection, good condition'),
('28ft Extension Ladder Louisville FE3228', 'ladder', 'in_use', 5, '2021-03-20', 420.00, 'Normal use'),
('24ft Extension Ladder Werner D6224-2', 'ladder', 'in_use', 6, '2022-01-15', 380.00, 'Good condition'),
('20ft Ladder Backup', 'ladder', 'available', NULL, '2019-08-15', 280.00, 'Warehouse backup'),
-- Power Tools
('DeWalt Impact Drill Set DCD996B', 'power_tool', 'in_use', 7, '2020-06-01', 380.00, 'Battery needs replacement'),
('Milwaukee Circular Saw M18 FUEL', 'power_tool', 'in_use', 8, '2021-07-15', 420.00, 'Sharp blade'),
('Makita Angle Grinder XAG04Z', 'power_tool', 'in_use', 9, '2022-02-20', 280.00, 'Normal use'),
('Ryobi Drill Set P1811', 'power_tool', 'maintenance', NULL, '2019-05-10', 220.00, 'Motor fault, in repair'),
-- Measuring Tools
('Bosch Laser Distance Meter GLM 50 C', 'measuring', 'in_use', NULL, '2021-04-10', 180.00, 'Office shared, calibrated'),
('Fluke Digital Multimeter 117', 'measuring', 'in_use', 1, '2020-08-15', 280.00, 'Electrical testing'),
('FLIR Thermal Imager TG165', 'measuring', 'in_use', 2, '2022-05-20', 420.00, 'Electrical connection inspection'),
-- Safety Equipment
('Miller Safety Harness Set Titan x5', 'safety', 'in_use', NULL, '2021-06-01', 550.00, '5 sets, regular inspection, warehouse storage'),
('3M Hard Hat H-700 x15', 'safety', 'in_use', NULL, '2020-03-01', 300.00, '15 units, some need replacement'),
('Safety Glasses Set x20', 'safety', 'available', NULL, '2023-01-15', 200.00, 'Warehouse backup'),
-- Other Equipment
('Solar Panel Transport Rack', 'transport', 'in_use', NULL, '2020-09-01', 1200.00, 'Dedicated transport equipment'),
('Cable Tester', 'measuring', 'in_use', 3, '2021-11-20', 350.00, 'Electrical testing');

-- ================================================
-- 12. Finance Records Table - Income and Expenses
-- ================================================
INSERT INTO finance_records (record_date, record_type, category, amount, project_id, staff_id, notes, created_by) VALUES
-- November Income
('2024-11-15', 'income', 'project_bonus', 500.00, 2, NULL, 'Project 2 customer extra bonus', 1),
('2024-11-20', 'income', 'consulting', 800.00, NULL, NULL, 'Solar consulting service fee', 1),
('2024-11-25', 'income', 'equipment_rental', 300.00, NULL, NULL, 'Equipment rental income', 1),
-- November Expenses
('2024-11-30', 'expense', 'fuel', 287.00, NULL, NULL, 'November vehicle fuel costs', 1),
('2024-11-25', 'expense', 'tools', 680.00, NULL, NULL, 'New power tools purchase', 1),
('2024-11-01', 'expense', 'office', 450.00, NULL, NULL, 'Office rent', 1),
('2024-11-05', 'expense', 'insurance', 1200.00, NULL, NULL, 'Vehicle insurance monthly fee', 1),
('2024-11-10', 'expense', 'utilities', 180.00, NULL, NULL, 'Office utilities', 1),
-- December Income
('2024-12-10', 'income', 'referral_bonus', 600.00, NULL, NULL, 'Customer referral bonus', 1),
('2024-12-15', 'income', 'equipment_rental', 350.00, NULL, NULL, 'Equipment rental income', 1),
('2024-12-20', 'income', 'consulting', 1000.00, NULL, NULL, 'Project consulting service', 1),
-- December Expenses
('2024-12-31', 'expense', 'fuel', 350.00, NULL, NULL, 'December vehicle fuel costs', 1),
('2024-12-12', 'expense', 'tools', 420.00, NULL, NULL, 'Tool repair and replenishment', 1),
('2024-12-01', 'expense', 'office', 450.00, NULL, NULL, 'Office rent', 1),
('2024-12-05', 'expense', 'insurance', 1200.00, NULL, NULL, 'Vehicle insurance monthly fee', 1),
('2024-12-18', 'expense', 'marketing', 850.00, NULL, NULL, 'Website maintenance and advertising', 1),
('2024-12-22', 'expense', 'training', 600.00, NULL, NULL, 'Staff safety training', 1),
('2024-12-15', 'expense', 'utilities', 195.00, NULL, NULL, 'Office utilities', 1),
-- Staff Bonus Expenses
('2024-12-25', 'expense', 'staff_bonus', 300.00, NULL, 4, 'Year-end bonus - Jason Lee', 1),
('2024-12-25', 'expense', 'staff_bonus', 300.00, NULL, 5, 'Year-end bonus - Amy Zhao', 1),
('2024-12-25', 'expense', 'staff_bonus', 300.00, NULL, 6, 'Year-end bonus - Jack Sun', 1),
('2024-12-25', 'expense', 'staff_bonus', 250.00, NULL, 1, 'Year-end bonus - Tom Zhang', 1),
('2024-12-25', 'expense', 'staff_bonus', 250.00, NULL, 2, 'Year-end bonus - Kevin Li', 1),
('2024-12-25', 'expense', 'staff_bonus', 250.00, NULL, 3, 'Year-end bonus - Mike Wang', 1);

-- ================================================
-- Data Statistics Query (Verification)
-- ================================================
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'Clients', COUNT(*) FROM clients
UNION ALL SELECT 'Staff', COUNT(*) FROM staff
UNION ALL SELECT 'Projects', COUNT(*) FROM projects
UNION ALL SELECT 'Project Inverters', COUNT(*) FROM project_inverters
UNION ALL SELECT 'Project Assignments', COUNT(*) FROM project_assignments
UNION ALL SELECT 'Project Progress', COUNT(*) FROM project_progress
UNION ALL SELECT 'Vehicles', COUNT(*) FROM vehicles
UNION ALL SELECT 'Vehicle Usage', COUNT(*) FROM vehicle_usage
UNION ALL SELECT 'Vehicle Maintenance', COUNT(*) FROM vehicle_maintenance
UNION ALL SELECT 'Assets', COUNT(*) FROM assets
UNION ALL SELECT 'Finance Records', COUNT(*) FROM finance_records;

-- ================================================
-- Mock Data Summary
-- ================================================
--
-- This file contains test data fully compatible with schema.sql:
-- 2 admin users (admin/manager, password: admin123)
-- 8 client companies (7 active + 1 inactive)
-- 15 staff members (3 electricians + 3 leaders + 8 installers + 1 former)
-- 12 projects (6 completed + 3 in progress + 3 pending)
-- 15 inverter records
-- 41 staff assignment records
-- 36 project progress records
-- 6 vehicles
-- 12 vehicle usage records
-- 8 vehicle maintenance records
-- 16 assets/equipment
-- 24 finance records
--
-- Total: 184 records covering all business scenarios
--
-- Financial Data Overview:
-- November Income: $1,600 | November Expenses: $2,797
-- December Income: $1,950 | December Expenses: $5,715
-- Project Revenue (calculated by watt x rate)
--
-- Project Wattage Statistics:
-- Completed: 28x400 + 45x450 + 60x440 + 32x450 + 50x400 + 38x450 = 109,350W
-- In Progress: 42x440 + 55x400 + 48x450 = 62,080W  
-- Pending: 35x450 + 52x440 + 40x400 = 54,630W
-- ================================================
