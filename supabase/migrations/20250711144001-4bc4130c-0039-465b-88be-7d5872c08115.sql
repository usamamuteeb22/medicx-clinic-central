
-- Clear all existing data from related tables (in correct order to avoid foreign key violations)
DELETE FROM medicine_prescriptions;
DELETE FROM patient_reports;
DELETE FROM patients;

-- Reset the patient_id sequence to start from 1
ALTER SEQUENCE patients_patient_id_seq RESTART WITH 1;

-- Ensure the patients category constraint is correctly set
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_category_check;
ALTER TABLE patients ADD CONSTRAINT patients_category_check 
CHECK (category IN ('Paid', 'Free', 'Thalassemic') OR category IS NULL);
