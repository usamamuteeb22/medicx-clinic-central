
-- Add a new column for the 2000 series report ID
ALTER TABLE patient_reports ADD COLUMN IF NOT EXISTS report_number INTEGER;

-- Create a sequence for the 2000 series starting from 2000
CREATE SEQUENCE IF NOT EXISTS patient_reports_number_seq START 2000;

-- Update existing reports to have report numbers if they don't have them
UPDATE patient_reports 
SET report_number = nextval('patient_reports_number_seq') 
WHERE report_number IS NULL;

-- Set default value for new reports
ALTER TABLE patient_reports ALTER COLUMN report_number SET DEFAULT nextval('patient_reports_number_seq');

-- Make sure the column is not null going forward
ALTER TABLE patient_reports ALTER COLUMN report_number SET NOT NULL;
