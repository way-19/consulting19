/*
  # Setup Test Client Accounting Profile

  1. New Records
    - Create accounting_clients record for Georgia Tech Solutions LLC
    - Add sample accounting documents for testing
    - Add sample accounting tasks
    - Add welcome message from consultant

  2. Data Setup
    - Client ID: 9a7ea787-c11e-44e0-9c81-eb4b1fc10d98
    - Consultant ID: 3732cae6-3238-44b6-9c6b-2f29f0216a83
    - Company: Georgia Tech Solutions LLC
    - Monthly fee: $500
    - Active status with upcoming deadlines

  3. Test Data
    - 3 sample documents (bank statements, receipts, tax docs)
    - 2 sample tasks (bookkeeping, compliance)
    - Welcome message from consultant
    - Current accounting period setup
*/

-- 1. Create accounting profile for test client
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

-- 2. Get the accounting client ID for subsequent inserts
DO $$
DECLARE
  accounting_client_id uuid;
BEGIN
  -- Get the accounting client ID we just created
  SELECT id INTO accounting_client_id 
  FROM accounting_clients 
  WHERE client_id = '9a7ea787-c11e-44e0-9c81-eb4b1fc10d98';

  -- 3. Add sample documents
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
    'Quarterly tax documentation and filings',
    '2025-01-31',
    'overdue',
    'urgent'
  );

  -- 4. Add sample tasks
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
    '2025-02-08',
    4
  ),
  (
    accounting_client_id,
    '3732cae6-3238-44b6-9c6b-2f29f0216a83',
    'Tax Compliance Check',
    'Ensure all tax obligations are met for Q1 2025',
    'compliance',
    'pending',
    'medium',
    '2025-02-20',
    2
  );

  -- 5. Add current accounting period
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
    '["bank_statements", "expense_receipts", "invoice_records"]',
    25
  );

  -- 6. Add welcome message from consultant
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
    '9a7ea787-c11e-44e0-9c81-eb4b1fc10d98',  -- Client receiving (this should be profile_id)
    'Welcome to Accounting Services',
    'Welcome to our accounting services! Please upload your January documents by February 5th. I will be your dedicated consultant for all accounting matters.',
    'en',
    'general'
  );

END $$;