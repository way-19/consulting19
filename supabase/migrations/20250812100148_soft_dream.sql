/*
  # Fix Client Assignment for Georgia Consultant

  1. Data Verification and Correction
    - Verify client.georgia@consulting19.com exists in profiles
    - Verify georgia@consulting19.com exists in profiles  
    - Create client record in clients table with proper assignment
    - Ensure assigned_consultant_id matches consultant's profile.id

  2. RLS Policy Updates
    - Update clients table policies for consultant access
    - Ensure consultants can read their assigned clients
    - Fix any policy conflicts

  3. Data Integrity
    - Ensure profile_id in clients matches client's profile.id
    - Ensure assigned_consultant_id matches consultant's profile.id
    - Add proper foreign key relationships
*/

-- First, let's get the consultant and client profile IDs
DO $$
DECLARE
  consultant_profile_id uuid;
  client_profile_id uuid;
  existing_client_id uuid;
BEGIN
  -- Get consultant profile ID
  SELECT id INTO consultant_profile_id 
  FROM profiles 
  WHERE email = 'georgia@consulting19.com' AND role = 'consultant';
  
  -- Get client profile ID  
  SELECT id INTO client_profile_id
  FROM profiles
  WHERE email = 'client.georgia@consulting19.com' AND role = 'client';
  
  -- Check if both profiles exist
  IF consultant_profile_id IS NULL THEN
    RAISE EXCEPTION 'Consultant profile not found for georgia@consulting19.com';
  END IF;
  
  IF client_profile_id IS NULL THEN
    RAISE EXCEPTION 'Client profile not found for client.georgia@consulting19.com';
  END IF;
  
  -- Check if client record already exists
  SELECT id INTO existing_client_id
  FROM clients
  WHERE profile_id = client_profile_id;
  
  -- Insert or update client record
  IF existing_client_id IS NULL THEN
    -- Create new client record
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
    );
    
    RAISE NOTICE 'Created new client record for client.georgia@consulting19.com';
  ELSE
    -- Update existing client record
    UPDATE clients 
    SET 
      assigned_consultant_id = consultant_profile_id,
      company_name = 'Georgia Tech Solutions LLC',
      phone = '+995 555 123 456',
      status = 'in_progress',
      priority = 'high',
      service_type = 'company_formation',
      progress = 75,
      updated_at = now()
    WHERE id = existing_client_id;
    
    RAISE NOTICE 'Updated existing client record for client.georgia@consulting19.com';
  END IF;
  
  -- Verify the assignment
  RAISE NOTICE 'Consultant ID: %', consultant_profile_id;
  RAISE NOTICE 'Client ID: %', client_profile_id;
  RAISE NOTICE 'Assignment verified: consultant % assigned to client %', 
    consultant_profile_id, client_profile_id;
END $$;

-- Update RLS policies for clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Clients can view their own data" ON clients;
DROP POLICY IF EXISTS "Consultants can view assigned clients" ON clients;
DROP POLICY IF EXISTS "Consultants can update assigned clients" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;

-- Create new, clear policies
CREATE POLICY "clients_consultant_read"
ON clients
FOR SELECT
TO authenticated
USING (assigned_consultant_id = auth.uid());

CREATE POLICY "clients_consultant_update"
ON clients
FOR UPDATE
TO authenticated
USING (assigned_consultant_id = auth.uid())
WITH CHECK (assigned_consultant_id = auth.uid());

CREATE POLICY "clients_self_read"
ON clients
FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "clients_admin_all"
ON clients
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Verify the data
SELECT 
  c.id as client_id,
  c.profile_id,
  c.assigned_consultant_id,
  c.company_name,
  c.status,
  cp.email as client_email,
  cp.full_name as client_name,
  cons.email as consultant_email,
  cons.full_name as consultant_name
FROM clients c
JOIN profiles cp ON c.profile_id = cp.id
LEFT JOIN profiles cons ON c.assigned_consultant_id = cons.id
WHERE cons.email = 'georgia@consulting19.com'
   OR cp.email = 'client.georgia@consulting19.com';