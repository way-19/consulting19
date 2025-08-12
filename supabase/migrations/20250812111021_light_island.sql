/*
  # Create Accounting Profile for Test Client

  1. Create accounting_clients record for test client
  2. Add sample documents and tasks
  3. Add welcome message
  4. Create accounting period

  This ensures the test client has a complete accounting setup.
*/

-- Step 1: Create accounting client profile
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
  '9a7ea787-c11e-44e0-9c81-eb4b1fc10d98',  -- Test client ID
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',  -- Georgia consultant ID
  'Georgia Tech Solutions LLC',
  'limited_company',
  'monthly',
  'standard',
  500.00,
  'active',
  '2025-02-15',
  7,
  'en'
) ON CONFLICT (client_id) DO UPDATE SET
  consultant_id = EXCLUDED.consultant_id,
  company_name = EXCLUDED.company_name,
  status = EXCLUDED.status;

-- Get the accounting client ID for next steps
DO $$
DECLARE
  accounting_client_id uuid;
BEGIN
  -- Get the accounting client ID
  SELECT id INTO accounting_client_id 
  FROM accounting_clients 
  WHERE client_id = '9a7ea787-c11e-44e0-9c81-eb4b1fc10d98';

  -- Step 2: Add sample documents
  INSERT INTO accounting_documents (
    client_id,
    consultant_id,
    document_type,
    category,
    title,
    description,
    due_date,
    status,
    priority
  ) VALUES 
  (
    accounting_client_id,
    '3732cae6-3238-44b6-9c6b-2f29f0216a83',
    'bank_statement',
    'financial',
    'January 2025 Bank Statements',
    'Monthly bank statements for accounting review',
    '2025-02-05',
    'pending',
    'high'
  ),
  (
    accounting_client_id,
    '3732cae6-3238-44b6-9c6b-2f29f0216a83',
    'expense_receipts',
    'financial',
    'January 2025 Expense Receipts',
    'All business expense receipts for January',
    '2025-02-10',
    'pending',
    'medium'
  ),
  (
    accounting_client_id,
    '3732cae6-3238-44b6-9c6b-2f29f0216a83',
    'tax_document',
    'tax',
    'Q4 2024 Tax Documents',
    'Quarterly tax filing documents',
    '2025-01-31',
    'overdue',
    'urgent'
  ) ON CONFLICT DO NOTHING;

  -- Step 3: Add sample tasks
  INSERT INTO accounting_tasks (
    client_id,
    consultant_id,
    title,
    description,
    task_type,
    status,
    priority,
    due_date,
    estimated_hours
  ) VALUES 
  (
    accounting_client_id,
    '3732cae6-3238-44b6-9c6b-2f29f0216a83',
    'Monthly Bookkeeping Review',
    'Review and process January 2025 transactions',
    'bookkeeping',
    'pending',
    'high',
    '2025-02-10',
    4
  ),
  (
    accounting_client_id,
    '3732cae6-3238-44b6-9c6b-2f29f0216a83',
    'Tax Compliance Check',
    'Ensure all tax obligations are met for Q1 2025',
    'tax_compliance',
    'pending',
    'medium',
    '2025-02-20',
    2
  ) ON CONFLICT DO NOTHING;

  -- Step 4: Add accounting period
  INSERT INTO accounting_periods (
    client_id,
    period_type,
    start_date,
    end_date,
    status,
    documents_required,
    completion_percentage
  ) VALUES (
    accounting_client_id,
    'monthly',
    '2025-01-01',
    '2025-01-31',
    'active',
    '["bank_statements", "expense_receipts", "invoices", "tax_documents"]'::jsonb,
    25
  ) ON CONFLICT DO NOTHING;

  -- Step 5: Add welcome message
  INSERT INTO accounting_messages (
    client_id,
    consultant_id,
    sender_id,
    recipient_id,
    subject,
    message,
    original_language,
    category
  ) VALUES (
    accounting_client_id,
    '3732cae6-3238-44b6-9c6b-2f29f0216a83',
    '3732cae6-3238-44b6-9c6b-2f29f0216a83',  -- Consultant sending
    (SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com'), -- Client receiving
    'Welcome to Accounting Services',
    'Welcome to our accounting services! I''ve set up your monthly accounting package. Please upload your January documents by February 5th. If you have any questions, feel free to message me.',
    'en',
    'general'
  ) ON CONFLICT DO NOTHING;

END $$;