/*
  # Step 1: Create Accounting Client Profile
  
  This creates the accounting_clients record first, which is required 
  before adding documents, tasks, and messages.
*/

-- Create accounting client profile
INSERT INTO accounting_clients (
  client_id,
  consultant_id,
  company_name,
  business_type,
  accounting_period,
  service_package,
  monthly_fee,
  status,
  next_deadline,
  reminder_frequency,
  preferred_language
) VALUES (
  '9a7ea787-c11e-44e0-9c81-eb4b1fc10d98',
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',
  'Georgia Tech Solutions LLC',
  'limited_company',
  'monthly',
  'standard',
  500.00,
  'active',
  '2025-02-15',
  7,
  'en'
);

-- Verify the record was created
SELECT 
  id,
  company_name,
  status,
  monthly_fee
FROM accounting_clients 
WHERE client_id = '9a7ea787-c11e-44e0-9c81-eb4b1fc10d98';