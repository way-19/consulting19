/*
  # Fix Document Request Features

  1. Database Changes
    - Add requested_by_consultant_id column to documents table
    - Add is_request boolean column to documents table  
    - Add due_date column to documents table
    - Update status check constraint to include 'requested'

  2. Security
    - Update RLS policies to handle document requests
    - Ensure consultants can create requests for their clients
    - Ensure clients can see requests from their consultants

  3. Notifications
    - Support for document request notifications
*/

-- Add new columns to documents table
DO $$
BEGIN
  -- Add requested_by_consultant_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'requested_by_consultant_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN requested_by_consultant_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_documents_requested_by ON documents(requested_by_consultant_id);
  END IF;

  -- Add is_request column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'is_request'
  ) THEN
    ALTER TABLE documents ADD COLUMN is_request boolean DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_documents_is_request ON documents(is_request);
  END IF;

  -- Add due_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE documents ADD COLUMN due_date timestamptz;
    CREATE INDEX IF NOT EXISTS idx_documents_due_date ON documents(due_date);
  END IF;

  -- Add notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'notes'
  ) THEN
    ALTER TABLE documents ADD COLUMN notes text;
  END IF;
END $$;

-- Update status constraint to include 'requested'
DO $$
BEGIN
  -- Drop existing constraint
  ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check;
  
  -- Add new constraint with 'requested' status
  ALTER TABLE documents ADD CONSTRAINT documents_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'needs_revision'::text, 'requested'::text]));
END $$;

-- Add RLS policy for document requests
CREATE POLICY "Consultants can create document requests" ON documents
  FOR INSERT TO authenticated
  WITH CHECK (
    requested_by_consultant_id = uid() AND 
    is_request = true AND
    client_id IN (
      SELECT clients.id FROM clients 
      WHERE clients.assigned_consultant_id = uid()
    )
  );

-- Add RLS policy for clients to view their document requests
CREATE POLICY "Clients can view document requests" ON documents
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT clients.id FROM clients 
      WHERE clients.profile_id = uid()
    ) AND 
    is_request = true
  );

-- Add RLS policy for clients to update document requests (upload files)
CREATE POLICY "Clients can fulfill document requests" ON documents
  FOR UPDATE TO authenticated
  USING (
    client_id IN (
      SELECT clients.id FROM clients 
      WHERE clients.profile_id = uid()
    ) AND 
    is_request = true
  )
  WITH CHECK (
    client_id IN (
      SELECT clients.id FROM clients 
      WHERE clients.profile_id = uid()
    )
  );