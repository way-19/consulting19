/*
  # Fix Client-Consultant Assignment

  1. Database Fixes
    - Ensure proper client assignment to Georgia consultant
    - Fix profile ID relationships
    - Update RLS policies for proper access
    - Create missing client record if needed

  2. Data Verification
    - Verify consultant and client profiles exist
    - Ensure proper foreign key relationships
    - Update assigned_consultant_id correctly

  3. Security
    - Update RLS policies for clients table
    - Ensure consultants can see their assigned clients
*/

-- First, let's verify the consultant profile exists and get the ID
DO $$
DECLARE
    georgia_consultant_id uuid;
    client_profile_id uuid;
    existing_client_id uuid;
BEGIN
    -- Get Georgia consultant profile ID
    SELECT id INTO georgia_consultant_id 
    FROM profiles 
    WHERE email = 'georgia@consulting19.com' AND role = 'consultant';
    
    -- Get client profile ID
    SELECT id INTO client_profile_id 
    FROM profiles 
    WHERE email = 'client.georgia@consulting19.com' AND role = 'client';
    
    -- Check if client record exists
    SELECT id INTO existing_client_id 
    FROM clients 
    WHERE profile_id = client_profile_id;
    
    -- Log the IDs for debugging
    RAISE NOTICE 'Georgia consultant ID: %', georgia_consultant_id;
    RAISE NOTICE 'Client profile ID: %', client_profile_id;
    RAISE NOTICE 'Existing client ID: %', existing_client_id;
    
    -- If consultant and client profiles exist
    IF georgia_consultant_id IS NOT NULL AND client_profile_id IS NOT NULL THEN
        -- If client record doesn't exist, create it
        IF existing_client_id IS NULL THEN
            INSERT INTO clients (
                profile_id,
                assigned_consultant_id,
                company_name,
                status,
                priority,
                service_type,
                progress
            ) VALUES (
                client_profile_id,
                georgia_consultant_id,
                'Test Client Company',
                'new',
                'medium',
                'company_formation',
                0
            );
            RAISE NOTICE 'Created new client record';
        ELSE
            -- Update existing client record to assign to Georgia consultant
            UPDATE clients 
            SET assigned_consultant_id = georgia_consultant_id,
                company_name = COALESCE(company_name, 'Test Client Company'),
                updated_at = now()
            WHERE id = existing_client_id;
            RAISE NOTICE 'Updated existing client record';
        END IF;
    ELSE
        RAISE NOTICE 'Missing profiles - Consultant: %, Client: %', georgia_consultant_id, client_profile_id;
    END IF;
END $$;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Consultants can view assigned clients" ON clients;
DROP POLICY IF EXISTS "Clients can view own data" ON clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON clients;

-- Create clear RLS policies for clients table
CREATE POLICY "consultants_view_assigned_clients" 
ON clients FOR SELECT 
TO authenticated 
USING (
    assigned_consultant_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "clients_view_own_record" 
ON clients FOR SELECT 
TO authenticated 
USING (profile_id = auth.uid());

CREATE POLICY "consultants_update_assigned_clients" 
ON clients FOR UPDATE 
TO authenticated 
USING (assigned_consultant_id = auth.uid())
WITH CHECK (assigned_consultant_id = auth.uid());

CREATE POLICY "admins_manage_all_clients" 
ON clients FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Verify the assignment worked
DO $$
DECLARE
    assignment_count integer;
BEGIN
    SELECT COUNT(*) INTO assignment_count
    FROM clients c
    JOIN profiles p ON c.profile_id = p.id
    JOIN profiles consultant ON c.assigned_consultant_id = consultant.id
    WHERE p.email = 'client.georgia@consulting19.com'
    AND consultant.email = 'georgia@consulting19.com';
    
    RAISE NOTICE 'Client-consultant assignments found: %', assignment_count;
END $$;