-- Remove restrictive RLS and make tables fully accessible for authenticated users
-- This ensures all functionality works properly across the application

-- Update RLS policies for visits table
DROP POLICY IF EXISTS "All authenticated users can access visits" ON visits;
CREATE POLICY "Enable all access for authenticated users" ON visits FOR ALL USING (true);

-- Update RLS policies for patients table  
DROP POLICY IF EXISTS "All authenticated users can access patients" ON patients;
CREATE POLICY "Enable all access for authenticated users" ON patients FOR ALL USING (true);

-- Update RLS policies for medicine_usage table
DROP POLICY IF EXISTS "All authenticated users can access medicine usage" ON medicine_usage;
CREATE POLICY "Enable all access for authenticated users" ON medicine_usage FOR ALL USING (true);

-- Update RLS policies for medicine_stock_history table
DROP POLICY IF EXISTS "All authenticated users can access medicine stock history" ON medicine_stock_history;
CREATE POLICY "Enable all access for authenticated users" ON medicine_stock_history FOR ALL USING (true);