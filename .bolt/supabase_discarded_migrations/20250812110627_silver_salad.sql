/*
  # Step 3: Add Welcome Message
  
  Add a welcome message from consultant to client.
  
  IMPORTANT: Replace ACCOUNTING_CLIENT_ID with the ID from Step 1
*/

-- Add welcome message from consultant to client
INSERT INTO accounting_messages (
  client_id,
  consultant_id,
  sender_id,
  recipient_id,
  subject,
  message,
  original_language,
  category,
  is_read
) VALUES (
  'ACCOUNTING_CLIENT_ID_FROM_STEP_1',  -- Replace with actual accounting_clients.id
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',  -- Consultant is sender
  '9a7ea787-c11e-44e0-9c81-eb4b1fc10d98',  -- Client profile_id is recipient
  'Welcome to Accounting Services',
  'Welcome to our accounting services! Please upload your January documents by February 5th. I will be handling your monthly bookkeeping and tax compliance.',
  'en',
  'general',
  false
);

-- Add accounting period
INSERT INTO accounting_periods (
  client_id,
  period_type,
  start_date,
  end_date,
  status,
  documents_required,
  completion_percentage
) VALUES (
  'ACCOUNTING_CLIENT_ID_FROM_STEP_1',  -- Replace with actual accounting_clients.id
  'monthly',
  '2025-01-01',
  '2025-01-31',
  'active',
  '["bank_statements", "expense_receipts", "invoice_copies", "payroll_records"]'::jsonb,
  25
);

-- Verify everything was created
SELECT 
  'Accounting Client' as type,
  company_name as name,
  status
FROM accounting_clients 
WHERE client_id = '9a7ea787-c11e-44e0-9c81-eb4b1fc10d98'
UNION ALL
SELECT 
  'Messages' as type,
  count(*)::text as name,
  'created' as status
FROM accounting_messages 
WHERE client_id = 'ACCOUNTING_CLIENT_ID_FROM_STEP_1'
UNION ALL
SELECT 
  'Documents' as type,
  count(*)::text as name,
  'created' as status
FROM accounting_documents 
WHERE client_id = 'ACCOUNTING_CLIENT_ID_FROM_STEP_1';