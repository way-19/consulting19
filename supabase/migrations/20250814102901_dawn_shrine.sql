/*
  # Add Password Reset Audit Support

  1. Security Enhancement
    - Ensure audit_logs table can track password reset actions
    - Add specific action types for password management
    - Enhance security logging for admin actions

  2. Audit Trail
    - Track who reset passwords and when
    - Maintain security compliance
    - Enable security monitoring
*/

-- Ensure audit_logs table exists and has proper structure
DO $$
BEGIN
  -- Check if audit_logs table exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'audit_logs' AND table_schema = 'public'
  ) THEN
    CREATE TABLE audit_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
      action text NOT NULL,
      target_table text,
      target_id text,
      old_values jsonb DEFAULT '{}',
      new_values jsonb DEFAULT '{}',
      ip_address text,
      user_agent text,
      timestamp timestamptz DEFAULT now()
    );
  END IF;

  -- Add index for performance if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_audit_logs_timestamp'
  ) THEN
    CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_audit_logs_user_id'
  ) THEN
    CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_audit_logs_action'
  ) THEN
    CREATE INDEX idx_audit_logs_action ON audit_logs(action);
  END IF;
END $$;

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy for admins to insert audit logs
CREATE POLICY "Admins can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy for system to insert audit logs (for Edge Functions)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);