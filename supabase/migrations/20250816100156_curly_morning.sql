/*
  # Disable automatic tracking number generation

  1. Changes
    - Disable the automatic tracking number generation trigger
    - Remove tracking numbers from existing records that haven't been manually set
    - Ensure tracking numbers are only set when consultants manually enter them

  2. Security
    - No security changes needed for this migration
*/

-- Disable the automatic tracking number generation trigger
ALTER TABLE public.virtual_mailbox_items DISABLE TRIGGER IF EXISTS generate_tracking_number_trigger;

-- Clear existing auto-generated tracking numbers (keep only manually set ones)
-- We'll assume auto-generated ones follow the pattern VM[date]-[code]
UPDATE public.virtual_mailbox_items 
SET tracking_number = NULL 
WHERE tracking_number IS NOT NULL 
  AND tracking_number LIKE 'VM%-%'
  AND status = 'pending';

-- Add a comment to document this change
COMMENT ON TABLE public.virtual_mailbox_items IS 'Virtual mailbox items - tracking numbers are manually entered by consultants';