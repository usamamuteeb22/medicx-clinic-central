
-- Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'reception', 'pharmacy');

-- Create users table for authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  full_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id SERIAL UNIQUE,
  name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(10) NOT NULL,
  phone_number VARCHAR(20),
  address TEXT,
  description TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicine categories enum
CREATE TYPE medicine_category AS ENUM ('tablet', 'syrup', 'injection');

-- Create medicines table
CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number SERIAL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category medicine_category NOT NULL,
  total_quantity INTEGER DEFAULT 0,
  expiry_date DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicine stock history table
CREATE TABLE medicine_stock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  stock_type VARCHAR(20) NOT NULL CHECK (stock_type IN ('add', 'remove')),
  quantity INTEGER NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Create medicine usage table for patients
CREATE TABLE medicine_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  medicine_id UUID REFERENCES medicines(id),
  quantity_used INTEGER NOT NULL,
  usage_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Insert the default admin user
INSERT INTO users (username, password_hash, role, full_name) 
VALUES ('ummi', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin User');

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

-- Create RLS policies for patients table
CREATE POLICY "All authenticated users can access patients" ON patients FOR ALL USING (true);

-- Create RLS policies for medicines table
CREATE POLICY "All authenticated users can access medicines" ON medicines FOR ALL USING (true);

-- Create RLS policies for medicine_stock_history table
CREATE POLICY "All authenticated users can access medicine stock history" ON medicine_stock_history FOR ALL USING (true);

-- Create RLS policies for medicine_usage table
CREATE POLICY "All authenticated users can access medicine usage" ON medicine_usage FOR ALL USING (true);

-- Create function to update medicine stock
CREATE OR REPLACE FUNCTION update_medicine_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock_type = 'add' THEN
    UPDATE medicines 
    SET total_quantity = total_quantity + NEW.quantity,
        expiry_date = NEW.expiry_date,
        last_updated = NOW()
    WHERE id = NEW.medicine_id;
  ELSIF NEW.stock_type = 'remove' THEN
    UPDATE medicines 
    SET total_quantity = total_quantity - NEW.quantity,
        last_updated = NOW()
    WHERE id = NEW.medicine_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update medicine stock
CREATE TRIGGER medicine_stock_update_trigger
  AFTER INSERT ON medicine_stock_history
  FOR EACH ROW
  EXECUTE FUNCTION update_medicine_stock();

-- Create function to reduce medicine stock when used for patients
CREATE OR REPLACE FUNCTION reduce_medicine_stock_on_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if sufficient stock is available
  IF (SELECT total_quantity FROM medicines WHERE id = NEW.medicine_id) < NEW.quantity_used THEN
    RAISE EXCEPTION 'Medicine is out of Stock';
  END IF;
  
  -- Insert record in stock history for tracking
  INSERT INTO medicine_stock_history (medicine_id, stock_type, quantity, created_by)
  VALUES (NEW.medicine_id, 'remove', NEW.quantity_used, NEW.created_by);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to reduce stock when medicine is used for patients
CREATE TRIGGER medicine_usage_stock_trigger
  BEFORE INSERT ON medicine_usage
  FOR EACH ROW
  EXECUTE FUNCTION reduce_medicine_stock_on_usage();
