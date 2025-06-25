
-- Create patient_reports table to store medical reports
CREATE TABLE patient_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  hemoglobin DECIMAL(4,1),
  wbc INTEGER,
  platelets INTEGER,
  blood_pressure VARCHAR(20),
  temperature DECIMAL(4,1),
  weight DECIMAL(5,1),
  clinical_complaint TEXT,
  medical_history TEXT,
  observations TEXT,
  recommendations TEXT,
  report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicine_prescriptions table to store prescribed medicines with dosage timing
CREATE TABLE medicine_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_report_id UUID REFERENCES patient_reports(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines(id),
  quantity INTEGER NOT NULL,
  morning BOOLEAN DEFAULT FALSE,
  evening BOOLEAN DEFAULT FALSE,
  night BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE patient_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_prescriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patient_reports
CREATE POLICY "All authenticated users can access patient reports" ON patient_reports FOR ALL USING (true);

-- Create RLS policies for medicine_prescriptions  
CREATE POLICY "All authenticated users can access medicine prescriptions" ON medicine_prescriptions FOR ALL USING (true);

-- Create function to handle medicine stock reduction on prescription
CREATE OR REPLACE FUNCTION reduce_stock_on_prescription()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if sufficient stock is available
  IF (SELECT total_quantity FROM medicines WHERE id = NEW.medicine_id) < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock available for medicine ID: %', NEW.medicine_id;
  END IF;
  
  -- Insert record in medicine_usage table for tracking
  INSERT INTO medicine_usage (patient_id, medicine_id, quantity_used, created_by)
  SELECT pr.patient_id, NEW.medicine_id, NEW.quantity, pr.created_by
  FROM patient_reports pr 
  WHERE pr.id = NEW.patient_report_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to reduce stock when medicine is prescribed
CREATE TRIGGER medicine_prescription_stock_trigger
  BEFORE INSERT ON medicine_prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION reduce_stock_on_prescription();
