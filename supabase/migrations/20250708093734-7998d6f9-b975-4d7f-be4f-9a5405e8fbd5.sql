
-- Create reception_reports table with Report ID starting from 2001
CREATE TABLE public.reception_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id INTEGER NOT NULL DEFAULT nextval('reception_reports_report_id_seq'),
  patient_id UUID NOT NULL,
  hemoglobin NUMERIC NULL,
  wbc INTEGER NULL,
  platelets INTEGER NULL,
  blood_pressure VARCHAR NULL,
  temperature NUMERIC NULL,
  weight NUMERIC NULL,
  clinical_complaint TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NULL,
  created_by_role TEXT NULL
);

-- Create sequence for report_id starting from 2001
CREATE SEQUENCE public.reception_reports_report_id_seq
  START WITH 2001
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- Set the sequence as the default for report_id column
ALTER TABLE public.reception_reports 
ALTER COLUMN report_id SET DEFAULT nextval('reception_reports_report_id_seq');

-- Enable Row Level Security
ALTER TABLE public.reception_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "All authenticated users can access reception reports" 
ON public.reception_reports 
FOR ALL 
USING (true);

-- Add foreign key constraint to patients table
ALTER TABLE public.reception_reports 
ADD CONSTRAINT reception_reports_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients(id);

-- Add foreign key constraint to users table
ALTER TABLE public.reception_reports 
ADD CONSTRAINT reception_reports_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.users(id);
