
-- Add the missing afternoon column to medicine_prescriptions table
ALTER TABLE medicine_prescriptions 
ADD COLUMN IF NOT EXISTS afternoon BOOLEAN DEFAULT FALSE;
