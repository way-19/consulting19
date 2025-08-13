/*
  # Create Accounting Profile for Test Client

  1. New Records
    - Create accounting_clients record for test client
    - Link to existing client record and consultant
    - Set up basic accounting configuration

  2. Data Setup
    - Monthly accounting package
    - Active status
    - Basic business type setup
    - Link to Georgia consultant

  3. Sample Data
    - Add sample accounting documents
    - Create sample reminders
    - Set up accounting periods
*/

-- First, get the client record for client.georgia@consulting19.com
DO $$
DECLARE
    client_record_id uuid;
    consultant_record_id uuid;
    accounting_client_id uuid;
BEGIN
    -- Get the client record
    SELECT c.id INTO client_record_id
    FROM clients c
    JOIN profiles p ON c.profile_id = p.id
    WHERE p.email = 'client.georgia@consulting19.com';

    -- Get the consultant record
    SELECT id INTO consultant_record_id
    FROM profiles
    WHERE email = 'georgia@consulting19.com';

    -- Only proceed if both records exist
    IF client_record_id IS NOT NULL AND consultant_record_id IS NOT NULL THEN
        -- Create accounting_clients record if it doesn't exist
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
            consultant_record_id,
            'Georgia Tech Solutions LLC',
            'limited_company',
            'monthly',
            'standard',
            500.00,
            'active',
            (CURRENT_DATE + INTERVAL '30 days'),
            7,
            'en'
        )
        ON CONFLICT (client_id) DO UPDATE SET
            consultant_id = EXCLUDED.consultant_id,
            company_name = EXCLUDED.company_name,
            business_type = EXCLUDED.business_type,
            accounting_period = EXCLUDED.accounting_period,
            service_package = EXCLUDED.service_package,
            monthly_fee = EXCLUDED.monthly_fee,
            status = EXCLUDED.status,
            next_deadline = EXCLUDED.next_deadline,
            reminder_frequency = EXCLUDED.reminder_frequency,
            preferred_language = EXCLUDED.preferred_language
        RETURNING id INTO accounting_client_id;

        -- Get the accounting client ID if it was updated instead of inserted
        IF accounting_client_id IS NULL THEN
            SELECT id INTO accounting_client_id
            FROM accounting_clients
            WHERE client_id = client_record_id;
        END IF;

        -- Create sample accounting documents
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
            consultant_record_id,
            'monthly_statements',
            'financial',
            'January 2025 Bank Statements',
            'Monthly bank statements for accounting review',
            (CURRENT_DATE + INTERVAL '15 days'),
            'pending',
            'medium'
        ),
        (
            accounting_client_id,
            consultant_record_id,
            'expense_receipts',
            'financial',
            'Q1 2025 Expense Receipts',
            'All business expense receipts for Q1 2025',
            (CURRENT_DATE + INTERVAL '20 days'),
            'pending',
            'high'
        ),
        (
            accounting_client_id,
            consultant_record_id,
            'tax_documents',
            'tax',
            'Annual Tax Declaration Documents',
            'Required documents for annual tax filing',
            (CURRENT_DATE + INTERVAL '45 days'),
            'pending',
            'urgent'
        )
        ON CONFLICT (client_id, title) DO NOTHING;

        -- Create sample accounting tasks
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
            consultant_record_id,
            'Monthly Bookkeeping Review',
            'Review and process monthly transactions',
            'bookkeeping',
            'pending',
            'medium',
            (CURRENT_DATE + INTERVAL '10 days'),
            4
        ),
        (
            accounting_client_id,
            consultant_record_id,
            'Tax Compliance Check',
            'Verify tax compliance for current period',
            'compliance',
            'pending',
            'high',
            (CURRENT_DATE + INTERVAL '7 days'),
            2
        )
        ON CONFLICT (client_id, title) DO NOTHING;

        -- Create sample accounting period
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
            '["bank_statements", "expense_receipts", "invoice_copies"]'::jsonb,
            25
        )
        ON CONFLICT (client_id, start_date, end_date) DO NOTHING;

        -- Create sample welcome message
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
            accounting_client_id,
            consultant_record_id,
            consultant_record_id,
            (SELECT profile_id FROM clients WHERE id = client_record_id),
            'Welcome to Accounting Services',
            'Welcome to our accounting services! I''m Nino, your dedicated accounting consultant. I''ll be helping you with all your accounting needs including monthly bookkeeping, tax preparation, and financial reporting. Please feel free to reach out if you have any questions.',
            'en',
            'general',
            false
        )
        ON CONFLICT (client_id, subject, message) DO NOTHING;

        RAISE NOTICE 'Accounting profile created successfully for client: %', client_record_id;
    ELSE
        RAISE NOTICE 'Client or consultant not found. Client ID: %, Consultant ID: %', client_record_id, consultant_record_id;
    END IF;
END $$;