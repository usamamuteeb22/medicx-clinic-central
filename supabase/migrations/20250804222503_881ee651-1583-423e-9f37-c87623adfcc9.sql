
-- Add note column to medicine_prescriptions table for per-medicine notes
ALTER TABLE medicine_prescriptions 
ADD COLUMN note TEXT;

-- Add patient_history column to patient_reports table
ALTER TABLE patient_reports 
ADD COLUMN patient_history TEXT;

-- Remove old notes columns from patient_reports table
ALTER TABLE patient_reports 
DROP COLUMN IF EXISTS medicine_notes,
DROP COLUMN IF EXISTS test_advice;
