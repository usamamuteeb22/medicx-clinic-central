
-- Drop foreign key constraints to allow medicine and patient deletions
-- This will allow deletions without cascading or blocking due to references

-- Drop foreign key constraint on medicine_usage table referencing medicines
ALTER TABLE medicine_usage DROP CONSTRAINT IF EXISTS medicine_usage_medicine_id_fkey;

-- Drop foreign key constraint on medicine_usage table referencing patients  
ALTER TABLE medicine_usage DROP CONSTRAINT IF EXISTS medicine_usage_patient_id_fkey;

-- Drop foreign key constraint on medicine_prescriptions table referencing medicines
ALTER TABLE medicine_prescriptions DROP CONSTRAINT IF EXISTS medicine_prescriptions_medicine_id_fkey;

-- Drop foreign key constraint on medicine_stock_history table referencing medicines
ALTER TABLE medicine_stock_history DROP CONSTRAINT IF EXISTS medicine_stock_history_medicine_id_fkey;

-- Drop foreign key constraint on patient_reports table referencing patients
ALTER TABLE patient_reports DROP CONSTRAINT IF EXISTS patient_reports_patient_id_fkey;
