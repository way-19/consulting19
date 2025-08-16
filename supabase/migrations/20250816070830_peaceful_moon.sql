/*
  # Add missing uid() function for RLS policies

  1. Functions
    - `uid()` - Returns the current authenticated user's ID
    - `handle_updated_at()` - Updates the updated_at timestamp

  2. Security
    - Essential for Row Level Security policies
    - Enables proper user-based data access control

  This migration adds the critical uid() function that's referenced in RLS policies
  but was missing from the database schema.
*/

-- Create the uid() function that returns the current user's ID
CREATE OR REPLACE FUNCTION uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.uid(),
    (current_setting('request.jwt.claims', true)::json ->> 'sub')::uuid
  );
$$;

-- Create handle_updated_at function for automatic timestamp updates
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create ensure_profile function for automatic profile creation
CREATE OR REPLACE FUNCTION ensure_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_user_id, email, legacy_role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    'client',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create handle_new_user function for auth trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_user_id, email, legacy_role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    'client',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create commission calculation function
CREATE OR REPLACE FUNCTION calculate_commission_split()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calculate 65% consultant commission, 35% platform fee
  NEW.consultant_commission = NEW.total_amount * 0.65;
  NEW.platform_fee = NEW.total_amount * 0.35;
  
  RETURN NEW;
END;
$$;

-- Create accounting commission calculation function
CREATE OR REPLACE FUNCTION calculate_accounting_commission_split()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calculate 65% consultant commission, 35% platform fee
  NEW.consultant_commission = NEW.amount * 0.65;
  NEW.platform_fee = NEW.amount * 0.35;
  
  RETURN NEW;
END;
$$;

-- Create order number generation function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.order_number = 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || 
                     lpad(nextval('order_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$;

-- Create sequence for order numbers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'order_number_seq') THEN
    CREATE SEQUENCE order_number_seq START 1000;
  END IF;
END $$;

-- Create accounting invoice number generation function
CREATE OR REPLACE FUNCTION generate_accounting_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.invoice_number = 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || 
                       lpad(nextval('invoice_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$;

-- Create sequence for invoice numbers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'invoice_number_seq') THEN
    CREATE SEQUENCE invoice_number_seq START 1000;
  END IF;
END $$;

-- Create tracking number generation function
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.tracking_number = 'TRK-' || to_char(now(), 'YYYYMMDD') || '-' || 
                        lpad(nextval('tracking_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$;

-- Create sequence for tracking numbers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'tracking_number_seq') THEN
    CREATE SEQUENCE tracking_number_seq START 100000;
  END IF;
END $$;

-- Create mailbox timestamp update function
CREATE OR REPLACE FUNCTION update_mailbox_timestamps()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update timestamps based on status changes
  IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
    NEW.sent_date = now();
  END IF;
  
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_date = now();
  END IF;
  
  IF NEW.status = 'viewed' AND OLD.status != 'viewed' THEN
    NEW.viewed_date = now();
  END IF;
  
  IF NEW.status = 'downloaded' AND OLD.status != 'downloaded' THEN
    NEW.downloaded_date = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create overdue reminders function
CREATE OR REPLACE FUNCTION create_overdue_reminders()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create reminder if document becomes overdue
  IF NEW.status = 'overdue' AND OLD.status != 'overdue' THEN
    INSERT INTO accounting_reminders (
      client_id,
      consultant_id,
      document_id,
      reminder_type,
      title,
      message,
      due_date,
      status,
      reminder_level
    ) VALUES (
      NEW.client_id,
      NEW.consultant_id,
      NEW.id,
      'document_overdue',
      'Document Overdue',
      'Document "' || NEW.title || '" is now overdue',
      NEW.due_date,
      'pending',
      1
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create invoice number setting function
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number = 'SO-' || to_char(now(), 'YYYYMMDD') || '-' || 
                         lpad(nextval('service_order_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Create sequence for service orders if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'service_order_seq') THEN
    CREATE SEQUENCE service_order_seq START 1000;
  END IF;
END $$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION uid() TO authenticated;
GRANT EXECUTE ON FUNCTION uid() TO anon;
GRANT EXECUTE ON FUNCTION handle_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;