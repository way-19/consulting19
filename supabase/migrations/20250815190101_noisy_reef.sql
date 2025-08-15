/*
  # Add virtual address fields to accounting clients

  1. New Columns
    - `virtual_address` (text) - The virtual address provided to the client
    - `virtual_address_service_start_date` (timestamp) - When virtual address service started
    - `virtual_address_next_payment_date` (timestamp) - Next payment due date for virtual address service

  2. Changes
    - Add virtual address tracking fields to accounting_clients table
    - Support for 6-month payment cycles (first 6 months prepaid, then every 6 months)
*/

-- Add virtual address fields to accounting_clients table
DO $$
BEGIN
  -- Add virtual_address column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounting_clients' AND column_name = 'virtual_address'
  ) THEN
    ALTER TABLE accounting_clients ADD COLUMN virtual_address text;
  END IF;

  -- Add virtual_address_service_start_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounting_clients' AND column_name = 'virtual_address_service_start_date'
  ) THEN
    ALTER TABLE accounting_clients ADD COLUMN virtual_address_service_start_date timestamptz;
  END IF;

  -- Add virtual_address_next_payment_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounting_clients' AND column_name = 'virtual_address_next_payment_date'
  ) THEN
    ALTER TABLE accounting_clients ADD COLUMN virtual_address_next_payment_date timestamptz;
  END IF;
END $$;