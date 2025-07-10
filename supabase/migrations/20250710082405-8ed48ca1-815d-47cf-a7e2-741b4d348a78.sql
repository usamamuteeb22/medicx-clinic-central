
-- First, let's fix the patients category check constraint properly
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_category_check;
ALTER TABLE patients ADD CONSTRAINT patients_category_check 
CHECK (category IN ('Paid', 'Free', 'Thalassemic') OR category IS NULL);

-- Clear all existing report data for a fresh start
DELETE FROM medicine_prescriptions WHERE patient_report_id IN (SELECT id FROM patient_reports);
DELETE FROM patient_reports;

-- Reset the sequence for reception reports to start from 2001
-- This will ensure proper sequential ordering
DROP SEQUENCE IF EXISTS reception_reports_report_id_seq CASCADE;
CREATE SEQUENCE reception_reports_report_id_seq START WITH 2001 INCREMENT BY 1;

-- If reception_reports table exists, update it to use the new sequence
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reception_reports') THEN
        ALTER TABLE reception_reports ALTER COLUMN report_id SET DEFAULT nextval('reception_reports_report_id_seq');
    END IF;
END $$;

-- Update patient_reports table to ensure proper sequential report IDs
-- Add a report_id column if it doesn't exist and set up sequencing
DO $$
BEGIN
    -- Add report_id column to patient_reports if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'patient_reports' AND column_name = 'report_id') THEN
        ALTER TABLE patient_reports ADD COLUMN report_id INTEGER;
    END IF;
    
    -- Set default value to use the sequence
    ALTER TABLE patient_reports ALTER COLUMN report_id SET DEFAULT nextval('reception_reports_report_id_seq');
END $$;
