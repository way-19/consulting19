/*
  # Step 2: Add Documents and Tasks
  
  After creating the accounting_clients record, now we can add 
  documents and tasks that reference it.
  
  IMPORTANT: Replace ACCOUNTING_CLIENT_ID with the ID returned from Step 1
*/

-- First, get the accounting_client_id from step 1
-- Copy the 'id' value from the previous query result and replace below

-- Add sample documents
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
  'ACCOUNTING_CLIENT_ID_FROM_STEP_1',  -- Replace with actual accounting_clients.id
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
  'ACCOUNTING_CLIENT_ID_FROM_STEP_1',  -- Replace with actual accounting_clients.id
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
  'ACCOUNTING_CLIENT_ID_FROM_STEP_1',  -- Replace with actual accounting_clients.id
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',
  'tax_documents',
  'tax',
  'Q4 2024 Tax Documents',
  'Quarterly tax filing documents',
  '2025-01-31',
  'overdue',
  'urgent'
);

-- Add sample tasks
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
  'ACCOUNTING_CLIENT_ID_FROM_STEP_1',  -- Replace with actual accounting_clients.id
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
  'ACCOUNTING_CLIENT_ID_FROM_STEP_1',  -- Replace with actual accounting_clients.id
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',
  'Tax Compliance Check',
  'Ensure all tax obligations are met for Q1 2025',
  'tax_compliance',
  'pending',
  'medium',
  '2025-02-20',
  2
);

-- Verify documents and tasks were created
SELECT 'Documents created:' as info, count(*) as count
FROM accounting_documents 
WHERE client_id = 'ACCOUNTING_CLIENT_ID_FROM_STEP_1'
UNION ALL
SELECT 'Tasks created:' as info, count(*) as count
FROM accounting_tasks 
WHERE client_id = 'ACCOUNTING_CLIENT_ID_FROM_STEP_1';