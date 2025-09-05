-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.reduce_stock_on_prescription()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.update_medicine_stock()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.reduce_medicine_stock_on_usage()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;