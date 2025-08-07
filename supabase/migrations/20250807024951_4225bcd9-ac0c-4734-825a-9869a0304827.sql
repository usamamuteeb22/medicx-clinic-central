
-- Add foreign key constraints to ensure proper relationships
ALTER TABLE medicine_usage 
ADD CONSTRAINT fk_medicine_usage_medicine 
FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL;

ALTER TABLE medicine_usage 
ADD CONSTRAINT fk_medicine_usage_patient 
FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL;

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_medicine_usage_medicine_id ON medicine_usage(medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicine_usage_patient_id ON medicine_usage(patient_id);
CREATE INDEX IF NOT EXISTS idx_medicine_usage_usage_date ON medicine_usage(usage_date);
