
-- Add CNIC field to patients table and modify age fields
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS cnic character varying,
ADD COLUMN IF NOT EXISTS age_years integer,
ADD COLUMN IF NOT EXISTS age_months integer, 
ADD COLUMN IF NOT EXISTS age_days integer,
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS description;

-- Add Capsule to medicine category enum
ALTER TYPE medicine_category ADD VALUE IF NOT EXISTS 'Capsule';

-- Update existing age column to age_years for backward compatibility
UPDATE public.patients 
SET age_years = age 
WHERE age_years IS NULL AND age IS NOT NULL;

-- The age column will be kept for backward compatibility but we'll use the new fields
