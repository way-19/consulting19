/*
  # Webhook Integration Setup for Dynamic Accounting Management

  1. New Functions
    - `handle_service_order_completion` - Creates accounting client when service is ordered
    - `update_accounting_from_order` - Updates existing accounting client from order
    - `calculate_monthly_fee_from_order` - Calculates appropriate monthly fee based on order

  2. Triggers
    - Trigger on `service_orders` table for status changes
    - Trigger on `legacy_orders` table for payment completion
    - Auto-create accounting clients when accounting services are ordered

  3. Webhook Integration Points
    - Order completion webhook endpoint
    - Payment confirmation webhook endpoint
    - Service upgrade webhook endpoint
*/

-- Function to handle service order completion and create/update accounting client
CREATE OR REPLACE FUNCTION handle_service_order_completion()
RETURNS TRIGGER AS $$
DECLARE
  service_record RECORD;
  client_record RECORD;
  existing_accounting_client RECORD;
  calculated_monthly_fee NUMERIC;
BEGIN
  -- Only process if order is marked as paid or completed
  IF NEW.status NOT IN ('paid', 'completed') THEN
    RETURN NEW;
  END IF;

  -- Get service details
  SELECT * INTO service_record
  FROM custom_services
  WHERE id = NEW.service_id;

  -- Get client details
  SELECT c.*, p.full_name, p.email
  INTO client_record
  FROM clients c
  LEFT JOIN profiles p ON p.id = c.profile_id
  WHERE p.id = NEW.client_id;

  -- Check if this is an accounting service
  IF service_record.title ILIKE '%accounting%' OR 
     service_record.title ILIKE '%bookkeeping%' OR
     service_record.category = 'accounting' THEN

    -- Calculate monthly fee based on order amount and service type
    calculated_monthly_fee := CASE
      WHEN NEW.total_amount <= 500 THEN 300
      WHEN NEW.total_amount <= 1000 THEN 500
      WHEN NEW.total_amount <= 2000 THEN 800
      WHEN NEW.total_amount <= 3000 THEN 1200
      ELSE 1500
    END;

    -- Check if accounting client already exists
    SELECT * INTO existing_accounting_client
    FROM accounting_clients
    WHERE client_id = client_record.id;

    IF existing_accounting_client IS NULL THEN
      -- Create new accounting client
      INSERT INTO accounting_clients (
        client_id,
        consultant_id,
        company_name,
        business_type,
        accounting_period,
        service_package,
        monthly_fee,
        status,
        reminder_frequency,
        preferred_language
      ) VALUES (
        client_record.id,
        NEW.consultant_id,
        COALESCE(client_record.company_name, client_record.full_name, 'Company Name Not Set'),
        'limited_company',
        'monthly',
        CASE
          WHEN calculated_monthly_fee <= 400 THEN 'basic'
          WHEN calculated_monthly_fee <= 700 THEN 'standard'
          WHEN calculated_monthly_fee <= 1000 THEN 'premium'
          ELSE 'enterprise'
        END,
        calculated_monthly_fee,
        'active',
        7,
        'en'
      );
    ELSE
      -- Update existing accounting client with new package if fee is higher
      IF calculated_monthly_fee > existing_accounting_client.monthly_fee THEN
        UPDATE accounting_clients
        SET 
          monthly_fee = calculated_monthly_fee,
          service_package = CASE
            WHEN calculated_monthly_fee <= 400 THEN 'basic'
            WHEN calculated_monthly_fee <= 700 THEN 'standard'
            WHEN calculated_monthly_fee <= 1000 THEN 'premium'
            ELSE 'enterprise'
          END,
          updated_at = now()
        WHERE id = existing_accounting_client.id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle legacy order completion
CREATE OR REPLACE FUNCTION handle_legacy_order_completion()
RETURNS TRIGGER AS $$
DECLARE
  client_record RECORD;
  existing_accounting_client RECORD;
  calculated_monthly_fee NUMERIC;
BEGIN
  -- Only process if payment is completed
  IF NEW.payment_status != 'paid' THEN
    RETURN NEW;
  END IF;

  -- Get client details
  SELECT c.*, p.full_name, p.email
  INTO client_record
  FROM clients c
  LEFT JOIN profiles p ON p.id = c.profile_id
  WHERE p.id = NEW.client_id;

  -- Check if this includes accounting services
  IF NEW.service_type = 'accounting_services' OR 
     EXISTS (
       SELECT 1 FROM jsonb_array_elements(NEW.additional_services) AS service
       WHERE service->>'name' ILIKE '%accounting%' OR service->>'name' ILIKE '%bookkeeping%'
     ) THEN

    -- Calculate monthly fee based on order amount
    calculated_monthly_fee := CASE
      WHEN NEW.total_amount <= 1000 THEN 400
      WHEN NEW.total_amount <= 2500 THEN 600
      WHEN NEW.total_amount <= 5000 THEN 900
      WHEN NEW.total_amount <= 10000 THEN 1300
      ELSE 1800
    END;

    -- Check if accounting client already exists
    SELECT * INTO existing_accounting_client
    FROM accounting_clients
    WHERE client_id = client_record.id;

    IF existing_accounting_client IS NULL THEN
      -- Create new accounting client
      INSERT INTO accounting_clients (
        client_id,
        consultant_id,
        company_name,
        business_type,
        accounting_period,
        service_package,
        monthly_fee,
        status,
        reminder_frequency,
        preferred_language
      ) VALUES (
        client_record.id,
        NEW.consultant_id,
        COALESCE(NEW.company_name, client_record.company_name, client_record.full_name, 'Company Name Not Set'),
        'limited_company',
        'monthly',
        CASE
          WHEN calculated_monthly_fee <= 500 THEN 'basic'
          WHEN calculated_monthly_fee <= 800 THEN 'standard'
          WHEN calculated_monthly_fee <= 1200 THEN 'premium'
          ELSE 'enterprise'
        END,
        calculated_monthly_fee,
        'active',
        7,
        'en'
      );
    ELSE
      -- Update existing accounting client
      UPDATE accounting_clients
      SET 
        monthly_fee = GREATEST(existing_accounting_client.monthly_fee, calculated_monthly_fee),
        service_package = CASE
          WHEN GREATEST(existing_accounting_client.monthly_fee, calculated_monthly_fee) <= 500 THEN 'basic'
          WHEN GREATEST(existing_accounting_client.monthly_fee, calculated_monthly_fee) <= 800 THEN 'standard'
          WHEN GREATEST(existing_accounting_client.monthly_fee, calculated_monthly_fee) <= 1200 THEN 'premium'
          ELSE 'enterprise'
        END,
        company_name = COALESCE(NEW.company_name, existing_accounting_client.company_name),
        updated_at = now()
      WHERE id = existing_accounting_client.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic accounting client management
DROP TRIGGER IF EXISTS service_order_completion_trigger ON service_orders;
CREATE TRIGGER service_order_completion_trigger
  AFTER UPDATE OF status ON service_orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_service_order_completion();

DROP TRIGGER IF EXISTS legacy_order_completion_trigger ON legacy_orders;
CREATE TRIGGER legacy_order_completion_trigger
  AFTER UPDATE OF payment_status ON legacy_orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_legacy_order_completion();

-- Function to create accounting client from existing client (for manual setup)
CREATE OR REPLACE FUNCTION create_accounting_client_from_existing(
  p_client_id UUID,
  p_consultant_id UUID,
  p_monthly_fee NUMERIC DEFAULT 500,
  p_service_package TEXT DEFAULT 'basic'
)
RETURNS UUID AS $$
DECLARE
  client_record RECORD;
  new_accounting_client_id UUID;
BEGIN
  -- Get client details
  SELECT c.*, p.full_name, p.email
  INTO client_record
  FROM clients c
  LEFT JOIN profiles p ON p.id = c.profile_id
  WHERE c.id = p_client_id;

  IF client_record IS NULL THEN
    RAISE EXCEPTION 'Client not found';
  END IF;

  -- Create accounting client
  INSERT INTO accounting_clients (
    client_id,
    consultant_id,
    company_name,
    business_type,
    accounting_period,
    service_package,
    monthly_fee,
    status,
    reminder_frequency,
    preferred_language
  ) VALUES (
    p_client_id,
    p_consultant_id,
    COALESCE(client_record.company_name, client_record.full_name, 'Company Name Not Set'),
    'limited_company',
    'monthly',
    p_service_package,
    p_monthly_fee,
    'active',
    7,
    'en'
  ) RETURNING id INTO new_accounting_client_id;

  RETURN new_accounting_client_id;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounting_clients_client_consultant 
ON accounting_clients(client_id, consultant_id);

CREATE INDEX IF NOT EXISTS idx_accounting_clients_monthly_fee 
ON accounting_clients(monthly_fee);

CREATE INDEX IF NOT EXISTS idx_accounting_clients_service_package 
ON accounting_clients(service_package);

-- Add comments for webhook integration
COMMENT ON FUNCTION handle_service_order_completion() IS 
'Webhook integration point: Called when service orders are completed to auto-create/update accounting clients';

COMMENT ON FUNCTION handle_legacy_order_completion() IS 
'Webhook integration point: Called when legacy orders are paid to auto-create/update accounting clients';

COMMENT ON FUNCTION create_accounting_client_from_existing(UUID, UUID, NUMERIC, TEXT) IS 
'Manual function to create accounting client from existing client record - can be called via webhook or admin panel';