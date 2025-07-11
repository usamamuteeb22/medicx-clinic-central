
-- Fix the reception reports table to use proper sequential IDs starting from 2001
-- First, let's check if the table exists and create the sequence properly

-- Drop existing sequence if it exists
DROP SEQUENCE IF EXISTS public.reception_reports_report_id_seq CASCADE;

-- Create a new sequence starting from 2001
CREATE SEQUENCE public.reception_reports_report_id_seq
  START WITH 2001
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- Update the reception_reports table to use the sequence
-- First, let's make sure the table has the correct structure
ALTER TABLE public.reception_reports 
DROP COLUMN IF EXISTS report_id;

ALTER TABLE public.reception_reports 
ADD COLUMN report_id INTEGER NOT NULL DEFAULT nextval('reception_reports_report_id_seq');

-- Set the sequence as owned by the column
ALTER SEQUENCE public.reception_reports_report_id_seq OWNED BY public.reception_reports.report_id;

-- Grant necessary permissions
GRANT USAGE, SELECT ON SEQUENCE public.reception_reports_report_id_seq TO anon, authenticated, service_role;
