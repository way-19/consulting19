/*
  # Fix Document Request System with Proper Auth Function

  1. New Columns
    - `requested_by_consultant_id` (uuid, nullable) - Links to consultant who requested the document
    - `is_request` (boolean, default false) - Flags if this is a document request vs uploaded document
    - `due_date` (timestamptz, nullable) - Optional deadline for document submission

  2. Status Updates
    - Add 'requested' to existing status check constraint
    - Keep existing status values intact

  3. Security
    - Add RLS policies for document requests using auth.uid()
    - Ensure consultants can request documents from their clients
    - Ensure clients can see requests made for them

  4. Indexes
    - Add index on requested_by_consultant_id for performance
    - Add index on is_request for filtering
*/

-- Add new columns to documents table
DO $$
BEGIN
  -- Add requested_by_consultant_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'requested_by_consultant_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN requested_by_consultant_id uuid;
  END IF;

  -- Add is_request column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'is_request'
  ) THEN
    ALTER TABLE documents ADD COLUMN is_request boolean DEFAULT false;
  END IF;

  -- Add due_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE documents ADD COLUMN due_date timestamptz;
  END IF;
END $$;

-- Add foreign key constraint for requested_by_consultant_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_requested_by_consultant_id_fkey'
  ) THEN
    ALTER TABLE documents 
    ADD CONSTRAINT documents_requested_by_consultant_id_fkey 
    FOREIGN KEY (requested_by_consultant_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update status constraint to include 'requested'
DO $$
BEGIN
  -- Drop existing constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_status_check'
  ) THEN
    ALTER TABLE documents DROP CONSTRAINT documents_status_check;
  END IF;

  -- Add updated constraint with 'requested' status
  ALTER TABLE documents 
  ADD CONSTRAINT documents_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'needs_revision'::text, 'requested'::text]));
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_requested_by_consultant_id 
ON documents(requested_by_consultant_id);

CREATE INDEX IF NOT EXISTS idx_documents_is_request 
ON documents(is_request);

CREATE INDEX IF NOT EXISTS idx_documents_due_date 
ON documents(due_date);

-- Add RLS policies for document requests
CREATE POLICY "Consultants can request documents from their clients"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_request = true AND 
    requested_by_consultant_id = auth.uid() AND
    client_id IN (
      SELECT id FROM clients WHERE assigned_consultant_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view document requests made for them"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    is_request = true AND
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update requested documents to upload them"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    is_request = true AND
    status = 'requested' AND
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Consultants can view document requests they made"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    is_request = true AND 
    requested_by_consultant_id = auth.uid()
  );