
-- Add category field to patients table
ALTER TABLE public.patients 
ADD COLUMN category TEXT CHECK (category IN ('PAID', 'FREE', 'THALASSEMIC'));

-- Update medicines category enum to include new options
ALTER TYPE medicine_category ADD VALUE 'sachet';
ALTER TYPE medicine_category ADD VALUE 'drops';
ALTER TYPE medicine_category ADD VALUE 'lotion';
ALTER TYPE medicine_category ADD VALUE 'cream';
ALTER TYPE medicine_category ADD VALUE 'ointment';
ALTER TYPE medicine_category ADD VALUE 'suspension';
ALTER TYPE medicine_category ADD VALUE 'gel';
ALTER TYPE medicine_category ADD VALUE 'infusion';
ALTER TYPE medicine_category ADD VALUE 'transfusion';

-- Add status and workflow fields to patient_reports table
ALTER TABLE public.patient_reports 
ADD COLUMN status TEXT DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'completed')),
ADD COLUMN reception_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN doctor_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN created_by_role TEXT;

-- Update existing reports to have completed status
UPDATE public.patient_reports SET status = 'completed' WHERE status IS NULL;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_patient_reports_status ON public.patient_reports(status);
CREATE INDEX IF NOT EXISTS idx_patient_reports_patient_id ON public.patient_reports(patient_id);
