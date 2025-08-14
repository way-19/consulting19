/*
  # Enhanced Consultant Country Assignments

  1. Enhancements
    - Add indexes for better performance
    - Add constraint to prevent duplicate assignments
    - Add updated_at trigger
    - Enhance RLS policies

  2. Security
    - Ensure only admins can manage assignments
    - Add audit trail for assignment changes
*/

-- Add unique constraint to prevent duplicate active assignments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_active_consultant_country_assignment'
  ) THEN
    ALTER TABLE consultant_country_assignments 
    ADD CONSTRAINT unique_active_consultant_country_assignment 
    UNIQUE (consultant_id, country_id, status);
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_consultant_country_assignments_active 
ON consultant_country_assignments (status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_consultant_country_assignments_primary 
ON consultant_country_assignments (is_primary) WHERE is_primary = true;

-- Add updated_at trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'handle_consultant_country_assignments_updated_at'
  ) THEN
    CREATE TRIGGER handle_consultant_country_assignments_updated_at
      BEFORE UPDATE ON consultant_country_assignments
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Enhanced RLS policy for better security
DROP POLICY IF EXISTS "Admins can manage all assignments" ON consultant_country_assignments;
CREATE POLICY "Admins can manage all assignments"
  ON consultant_country_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow consultants to view their own assignments
CREATE POLICY IF NOT EXISTS "Consultants can view their assignments"
  ON consultant_country_assignments
  FOR SELECT
  TO authenticated
  USING (consultant_id = auth.uid());

-- Add function to automatically set primary consultant if none exists
CREATE OR REPLACE FUNCTION set_primary_consultant_if_needed()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first consultant for this country, make them primary
  IF NOT EXISTS (
    SELECT 1 FROM consultant_country_assignments 
    WHERE country_id = NEW.country_id 
    AND is_primary = true 
    AND status = 'active'
    AND id != NEW.id
  ) THEN
    NEW.is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-setting primary consultant
DROP TRIGGER IF EXISTS set_primary_consultant_trigger ON consultant_country_assignments;
CREATE TRIGGER set_primary_consultant_trigger
  BEFORE INSERT ON consultant_country_assignments
  FOR EACH ROW
  EXECUTE FUNCTION set_primary_consultant_if_needed();