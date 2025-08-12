/*
  # Fix Client Accounting Profile with Correct IDs

  1. Create accounting profile for test client
  2. Add sample documents and tasks
  3. Add welcome message
  4. Create accounting period

  Using real profile IDs from console logs:
  - Client Profile ID: bf06c8c3-d651-40f4-8e1b-ba0193306ee0
  - Consultant Profile ID: 3732cae6-3238-44b6-9c6b-2f29f0216a83
*/

-- Step 1: First get the correct client record ID
DO $$
DECLARE
    client_record_id uuid;
    accounting_client_id uuid;
BEGIN
    -- Get the client record ID from clients table
    SELECT id INTO client_record_id 
    FROM clients 
    WHERE profile_id = 'bf06c8c3-d651-40f4-8e1b-ba0193306ee0';
    
    -- If client record doesn't exist, create it first
    IF client_record_id IS NULL THEN
        INSERT INTO clients (
            profile_id,
            assigned_consultant_id,
            company_name,
            status,
            priority,
            service_type,
            progress
        ) VALUES (
            'bf06c8c3-d651-40f4-8e1b-ba0193306ee0',
            '3732cae6-3238-44b6-9c6b-2f29f0216a83',
            'Georgia Tech Solutions LLC',
            'in_progress',
            'medium',
            'company_formation',
            45
        ) RETURNING id INTO client_record_id;
        
        RAISE NOTICE 'Created new client record with ID: %', client_record_id;
    END IF;
    
    -- Now create accounting_clients record
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
        client_record_id,
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
    ) RETURNING id INTO accounting_client_id;
    
    RAISE NOTICE 'Created accounting client with ID: %', accounting_client_id;
    
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
        accounting_client_id,
        '3732cae6-3238-44b6-9c6b-2f29f0216a83',
        'Monthly Bookkeeping Review',
        'Review and process January 2025 transactions',
        'bookkeeping',
        'pending',
        'high',
        '2025-02-10',
        8
    ),
    (
        accounting_client_id,
        '3732cae6-3238-44b6-9c6b-2f29f0216a83',
        'Tax Compliance Check',
        'Ensure all tax obligations are met for Q1 2025',
        'tax_compliance',
        'pending',
        'medium',
        '2025-03-15',
        4
    );
    
    -- Add welcome message
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
        '3732cae6-3238-44b6-9c6b-2f29f0216a83',
        'bf06c8c3-d651-40f4-8e1b-ba0193306ee0',
        'Welcome to Accounting Services',
        'Welcome to our accounting services! I''ve set up your monthly package. Please upload your January documents by February 5th. Let me know if you have any questions!',
        'en',
        'general'
    );
    
    -- Create current accounting period
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
        '["bank_statements", "expense_receipts", "income_records"]'::jsonb,
        25
    );
    
    RAISE NOTICE 'Setup completed successfully for client: Georgia Tech Solutions LLC';
    
END $$;