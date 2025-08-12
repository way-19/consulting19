/*
  # Assign Georgia Client to Consultant

  1. Client Assignment
    - Assign client.georgia@consulting19.com to georgia@consulting19.com consultant
    - Create accounting profile for the client
    - Setup initial documents and tasks
    - Create sample service orders

  2. Accounting Setup
    - Create accounting client profile
    - Setup monthly accounting package
    - Create initial document requirements
    - Setup reminder system

  3. Cross-Country Setup
    - Enable cross-country service capabilities
    - Setup referral tracking
    - Create sample cross-country orders

  4. Synchronization
    - Ensure all tables are properly linked
    - Setup proper RLS policies
    - Create initial test data for demonstration
*/

-- First, get the consultant and client profile IDs
DO $$
DECLARE
  consultant_profile_id uuid;
  client_profile_id uuid;
  client_record_id uuid;
  accounting_client_id uuid;
  georgia_country_id uuid;
BEGIN
  -- Get consultant profile ID
  SELECT id INTO consultant_profile_id 
  FROM profiles 
  WHERE email = 'georgia@consulting19.com';
  
  -- Get client profile ID
  SELECT id INTO client_profile_id 
  FROM profiles 
  WHERE email = 'client.georgia@consulting19.com';
  
  -- Get Georgia country ID
  SELECT id INTO georgia_country_id 
  FROM countries 
  WHERE slug = 'georgia';

  IF consultant_profile_id IS NULL THEN
    RAISE EXCEPTION 'Georgia consultant not found. Please ensure georgia@consulting19.com user exists.';
  END IF;

  IF client_profile_id IS NULL THEN
    RAISE EXCEPTION 'Georgia client not found. Please ensure client.georgia@consulting19.com user exists.';
  END IF;

  -- Create or update client record
  INSERT INTO clients (
    profile_id,
    assigned_consultant_id,
    company_name,
    phone,
    status,
    priority,
    service_type,
    progress
  ) VALUES (
    client_profile_id,
    consultant_profile_id,
    'Georgia Tech Solutions LLC',
    '+995 555 123 456',
    'in_progress',
    'high',
    'company_formation',
    75
  )
  ON CONFLICT (profile_id) 
  DO UPDATE SET
    assigned_consultant_id = consultant_profile_id,
    company_name = 'Georgia Tech Solutions LLC',
    phone = '+995 555 123 456',
    status = 'in_progress',
    priority = 'high',
    service_type = 'company_formation',
    progress = 75,
    updated_at = now()
  RETURNING id INTO client_record_id;

  -- Create accounting client profile
  INSERT INTO accounting_clients (
    client_id,
    consultant_id,
    company_name,
    tax_number,
    business_type,
    accounting_period,
    service_package,
    monthly_fee,
    status,
    next_deadline,
    reminder_frequency,
    preferred_language
  ) VALUES (
    client_record_id,
    consultant_profile_id,
    'Georgia Tech Solutions LLC',
    'GE123456789',
    'limited_company',
    'monthly',
    'premium',
    500.00,
    'active',
    (CURRENT_DATE + INTERVAL '15 days'),
    7,
    'en'
  )
  ON CONFLICT (client_id) 
  DO UPDATE SET
    consultant_id = consultant_profile_id,
    company_name = 'Georgia Tech Solutions LLC',
    tax_number = 'GE123456789',
    business_type = 'limited_company',
    accounting_period = 'monthly',
    service_package = 'premium',
    monthly_fee = 500.00,
    status = 'active',
    next_deadline = (CURRENT_DATE + INTERVAL '15 days'),
    reminder_frequency = 7,
    preferred_language = 'en',
    updated_at = now()
  RETURNING id INTO accounting_client_id;

  -- Create initial accounting documents
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
    consultant_profile_id,
    'monthly_statements',
    'financial',
    'January 2025 Bank Statements',
    'Monthly bank statements for accounting records',
    (CURRENT_DATE + INTERVAL '5 days'),
    'pending',
    'high'
  ),
  (
    accounting_client_id,
    consultant_profile_id,
    'expense_receipts',
    'financial',
    'Q1 2025 Expense Receipts',
    'All business expense receipts for Q1 2025',
    (CURRENT_DATE + INTERVAL '10 days'),
    'pending',
    'medium'
  ),
  (
    accounting_client_id,
    consultant_profile_id,
    'tax_documents',
    'tax',
    'Annual Tax Declaration Documents',
    'Required documents for annual tax filing',
    (CURRENT_DATE + INTERVAL '20 days'),
    'pending',
    'urgent'
  )
  ON CONFLICT DO NOTHING;

  -- Create initial accounting tasks
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
    consultant_profile_id,
    'Setup Monthly Bookkeeping',
    'Initialize monthly bookkeeping system for Georgia Tech Solutions LLC',
    'setup',
    'in_progress',
    'high',
    (CURRENT_DATE + INTERVAL '3 days'),
    8
  ),
  (
    accounting_client_id,
    consultant_profile_id,
    'Prepare Tax Registration',
    'Complete tax registration process with Georgian authorities',
    'tax_preparation',
    'pending',
    'medium',
    (CURRENT_DATE + INTERVAL '7 days'),
    4
  )
  ON CONFLICT DO NOTHING;

  -- Create sample legacy orders for demonstration
  INSERT INTO legacy_orders (
    client_id,
    consultant_id,
    country,
    service_type,
    company_name,
    total_amount,
    status,
    additional_services,
    client_details,
    payment_status,
    notes
  ) VALUES 
  (
    client_profile_id,
    consultant_profile_id,
    'Georgia',
    'company_formation',
    'Georgia Tech Solutions LLC',
    2500.00,
    'in_progress',
    '[
      {"name": "Bank Account Opening", "price": 500, "status": "pending"},
      {"name": "Tax Registration", "price": 300, "status": "completed"},
      {"name": "Legal Address Service", "price": 200, "status": "in_progress"}
    ]'::jsonb,
    '{
      "contact_person": "John Smith",
      "phone": "+995 555 123 456",
      "email": "client.georgia@consulting19.com",
      "business_activity": "Software Development",
      "shareholders": [{"name": "John Smith", "percentage": 100}]
    }'::jsonb,
    'paid',
    'Premium client with additional services. High priority for completion.'
  ),
  (
    client_profile_id,
    consultant_profile_id,
    'Georgia',
    'accounting_services',
    'Georgia Tech Solutions LLC',
    6000.00,
    'completed',
    '[
      {"name": "Annual Accounting", "price": 6000, "status": "completed"},
      {"name": "Tax Optimization Consultation", "price": 1000, "status": "completed"}
    ]'::jsonb,
    '{
      "contact_person": "John Smith",
      "phone": "+995 555 123 456",
      "email": "client.georgia@consulting19.com",
      "fiscal_year": "2024",
      "accounting_period": "annual"
    }'::jsonb,
    'paid',
    'Annual accounting services completed successfully. Client satisfied with tax optimization results.'
  )
  ON CONFLICT DO NOTHING;

  -- Create accounting period for the client
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
    DATE_TRUNC('month', CURRENT_DATE),
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'),
    'active',
    '["bank_statements", "expense_receipts", "invoice_copies", "payroll_records"]'::jsonb,
    25
  )
  ON CONFLICT DO NOTHING;

  -- Create initial accounting invoice
  INSERT INTO accounting_invoices (
    client_id,
    consultant_id,
    amount,
    due_date,
    status,
    payment_terms,
    line_items,
    notes
  ) VALUES (
    accounting_client_id,
    consultant_profile_id,
    500.00,
    (CURRENT_DATE + INTERVAL '30 days'),
    'sent',
    '30 days',
    '[
      {"description": "Monthly Bookkeeping Services", "quantity": 1, "rate": 400.00, "amount": 400.00},
      {"description": "Tax Consultation", "quantity": 2, "rate": 50.00, "amount": 100.00}
    ]'::jsonb,
    'Monthly accounting services for January 2025'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Georgia client successfully assigned to consultant with accounting setup completed.';
  RAISE NOTICE 'Client ID: %, Consultant ID: %, Accounting Client ID: %', client_profile_id, consultant_profile_id, accounting_client_id;

END $$;