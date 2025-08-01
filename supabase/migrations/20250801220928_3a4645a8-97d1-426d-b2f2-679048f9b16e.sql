
-- Remove old vitals columns and add new ones
ALTER TABLE patient_reports 
DROP COLUMN IF EXISTS hemoglobin,
DROP COLUMN IF EXISTS wbc, 
DROP COLUMN IF EXISTS platelets;

ALTER TABLE patient_reports 
ADD COLUMN bsr NUMERIC,
ADD COLUMN saturation NUMERIC,
ADD COLUMN medicine_notes TEXT,
ADD COLUMN test_advice TEXT;

-- Add days column to medicine_prescriptions table
ALTER TABLE medicine_prescriptions 
ADD COLUMN days INTEGER DEFAULT 1;
