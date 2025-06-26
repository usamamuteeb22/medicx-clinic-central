
-- Insert the new user roles with their credentials
INSERT INTO users (username, password_hash, role, full_name) VALUES
('reception', 'reception4568', 'reception', 'Reception User'),
('doctor', 'doctor7891', 'doctor', 'Doctor User'),
('pharmacy', 'pharmacy1235', 'pharmacy', 'Pharmacy User')
ON CONFLICT (username) DO NOTHING;

-- Update the medicine_stock_history table to track which user type made the change
ALTER TABLE medicine_stock_history 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50);

-- Update existing records to set user_type based on context
UPDATE medicine_stock_history 
SET user_type = 'pharmacy' 
WHERE user_type IS NULL AND stock_type IN ('add', 'remove');

-- Add a function to get user role by user_id
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM users WHERE id = user_uuid;
    RETURN COALESCE(user_role, 'unknown');
END;
$$;
