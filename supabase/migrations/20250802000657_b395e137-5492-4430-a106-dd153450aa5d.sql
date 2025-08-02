
-- Add missing fields to medicine_prescriptions table
ALTER TABLE public.medicine_prescriptions 
ADD COLUMN IF NOT EXISTS before_meal boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS after_meal boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fasting boolean DEFAULT false;
