/*
  # Fix Client ID Mismatch in Accounting Clients

  1. Problem
    - Console shows real client profile_id: bf06c8c3-d651-40f4-8e1b-ba0193306ee0
    - Database has wrong client_id: 9a7ea787-c11e-44e0-9c81-eb4b1fc10d98
    - This causes "No Accounting Profile" error

  2. Solution
    - Find correct client record using real profile_id
    - Update all accounting_clients records with correct client_id
    - Update related documents, tasks, messages with correct IDs

  3. Verification
    - Check that client dashboard now shows accounting profile
    - Verify consultant dashboard shows this client
*/

-- Step 1: Find the correct client record using the real profile_id
DO $$
DECLARE
    correct_client_id uuid;
    consultant_id uuid := '3732cae6-3238-44b6-9c6b-2f29f0216a83';
    wrong_client_id uuid := '9a7ea787-c11e-44e0-9c81-eb4b1fc10d98';
BEGIN
    -- Get the correct client_id using the real profile_id from console
    SELECT id INTO correct_client_id
    FROM clients 
    WHERE profile_id = 'bf06c8c3-d651-40f4-8e1b-ba0193306ee0';
    
    -- If no client record exists, create it
    IF correct_client_id IS NULL THEN
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
            consultant_id,
            'Georgia Tech Solutions LLC',
            'in_progress',
            'high',
            'company_formation',
            75
        ) RETURNING id INTO correct_client_id;
        
        RAISE NOTICE 'Created new client record with ID: %', correct_client_id;
    ELSE
        -- Update existing client record to ensure consultant assignment
        UPDATE clients 
        SET 
            assigned_consultant_id = consultant_id,
            company_name = COALESCE(company_name, 'Georgia Tech Solutions LLC'),
            status = COALESCE(status, 'in_progress'),
            priority = COALESCE(priority, 'high'),
            service_type = COALESCE(service_type, 'company_formation'),
            progress = COALESCE(progress, 75)
        WHERE id = correct_client_id;
        
        RAISE NOTICE 'Updated existing client record with ID: %', correct_client_id;
    END IF;
    
    -- Update all accounting_clients records with correct client_id
    UPDATE accounting_clients 
    SET client_id = correct_client_id
    WHERE client_id = wrong_client_id;
    
    -- Update all related accounting_documents
    UPDATE accounting_documents 
    SET client_id = (
        SELECT id FROM accounting_clients WHERE client_id = correct_client_id LIMIT 1
    )
    WHERE client_id IN (
        SELECT id FROM accounting_clients WHERE client_id = wrong_client_id
    );
    
    -- Update all related accounting_tasks
    UPDATE accounting_tasks 
    SET client_id = (
        SELECT id FROM accounting_clients WHERE client_id = correct_client_id LIMIT 1
    )
    WHERE client_id IN (
        SELECT id FROM accounting_clients WHERE client_id = wrong_client_id
    );
    
    -- Update all related accounting_messages
    UPDATE accounting_messages 
    SET client_id = (
        SELECT id FROM accounting_clients WHERE client_id = correct_client_id LIMIT 1
    )
    WHERE client_id IN (
        SELECT id FROM accounting_clients WHERE client_id = wrong_client_id
    );
    
    -- Update all related accounting_reminders
    UPDATE accounting_reminders 
    SET client_id = (
        SELECT id FROM accounting_clients WHERE client_id = correct_client_id LIMIT 1
    )
    WHERE client_id IN (
        SELECT id FROM accounting_clients WHERE client_id = wrong_client_id
    );
    
    RAISE NOTICE 'Successfully updated all records with correct client_id: %', correct_client_id;
END $$;

-- Verification query - check if everything is connected properly
SELECT 
    'VERIFICATION RESULTS' as status,
    ac.id as accounting_client_id,
    ac.company_name,
    c.id as client_id,
    c.profile_id,
    p.email,
    p.full_name,
    p.role
FROM accounting_clients ac
JOIN clients c ON ac.client_id = c.id  
JOIN profiles p ON c.profile_id = p.id
WHERE p.email = 'client.georgia@consulting19.com';