
-- Fix the patients category check constraint to allow the correct values
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_category_check;
ALTER TABLE patients ADD CONSTRAINT patients_category_check 
CHECK (category IN ('Paid', 'Free', 'Thalassemic') OR category IS NULL);

-- Check if reception_reports table exists and create the sequence if needed
DO $$
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reception_reports') THEN
        -- Reset the sequence to start from 2001 if it exists
        IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'reception_reports_report_id_seq') THEN
            SELECT setval('reception_reports_report_id_seq', 2001, false);
        END IF;
    END IF;
END $$;

-- Ensure the report_id column in reception_reports uses the sequence properly
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reception_reports') THEN
        -- Make sure the default is set correctly
        ALTER TABLE reception_reports ALTER COLUMN report_id SET DEFAULT nextval('reception_reports_report_id_seq');
    END IF;
END $$;
