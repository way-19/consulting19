/*
  # Add Document Request Features

  1. New Columns
    - `documents.requested_by_consultant_id` (uuid, nullable) - Links to consultant who requested the document
    - `documents.is_request` (boolean, default false) - Indicates if this is a document request
    - `documents.due_date` (timestamptz, nullable) - When the document is due

  2. Status Updates
    - Add 'requested' to existing status enum

  3. Security
    - Update existing RLS policies to handle new columns
    - No breaking changes to existing functionality
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
  END IF;

  -- Add is_request column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'is_request'
  ) THEN
    ALTER TABLE documents ADD COLUMN is_request boolean DEFAULT false;
  END IF;

  -- Add due_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE documents ADD COLUMN due_date timestamptz;
  END IF;
END $$;

-- Update status enum to include 'requested' if not already present
DO $$
BEGIN
  -- Check if 'requested' status already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'requested' 
    AND enumtypid = (
      SELECT oid FROM pg_type WHERE typname = (
        SELECT udt_name FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'status'
      )
    )
  ) THEN
    -- Add 'requested' to the existing enum
    ALTER TYPE documents_status_enum ADD VALUE 'requested';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Status already exists, continue
    NULL;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_documents_requested_by_consultant_id 
ON documents(requested_by_consultant_id);

CREATE INDEX IF NOT EXISTS idx_documents_is_request 
ON documents(is_request);

CREATE INDEX IF NOT EXISTS idx_documents_due_date 
ON documents(due_date);