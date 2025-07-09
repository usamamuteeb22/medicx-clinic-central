
-- Clear all existing data from tables
DELETE FROM medicine_prescriptions;
DELETE FROM medicine_usage;
DELETE FROM medicine_stock_history;
DELETE FROM patient_reports;
DELETE FROM reception_reports;
DELETE FROM patients;
DELETE FROM medicines;

-- Reset sequences to their starting values
ALTER SEQUENCE patients_patient_id_seq RESTART WITH 1;
ALTER SEQUENCE medicines_serial_number_seq RESTART WITH 1;
ALTER SEQUENCE reception_reports_report_id_seq RESTART WITH 2001;

-- Update medicine category enum to include new options
ALTER TYPE medicine_category ADD VALUE 'gel';
ALTER TYPE medicine_category ADD VALUE 'ointment';
ALTER TYPE medicine_category ADD VALUE 'cream';
ALTER TYPE medicine_category ADD VALUE 'suspension';
ALTER TYPE medicine_category ADD VALUE 'drops';
ALTER TYPE medicine_category ADD VALUE 'sachet';
ALTER TYPE medicine_category ADD VALUE 'infusion';
ALTER TYPE medicine_category ADD VALUE 'transfusion';
ALTER TYPE medicine_category ADD VALUE 'lotion';

-- Add category column to patients table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'patients' AND column_name = 'category') THEN
        ALTER TABLE patients ADD COLUMN category TEXT;
    END IF;
END $$;
