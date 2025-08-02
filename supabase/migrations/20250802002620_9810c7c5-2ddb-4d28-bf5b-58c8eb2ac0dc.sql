
-- Add foreign key constraints to medicine_usage table to establish proper relationships
ALTER TABLE medicine_usage 
ADD CONSTRAINT medicine_usage_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES patients(id);

ALTER TABLE medicine_usage 
ADD CONSTRAINT medicine_usage_medicine_id_fkey 
FOREIGN KEY (medicine_id) REFERENCES medicines(id);
