/*
  # Enhance Audit Logs Table

  1. Table Updates
    - Add `user_agent` column to store browser information
    - Add `ip_address` column to store client IP addresses
    - Add `session_id` column to track user sessions
    - Add indexes for better query performance

  2. Security
    - Maintain existing RLS policies
    - Add indexes for efficient filtering and searching

  3. Performance
    - Add composite indexes for common query patterns
    - Optimize for admin dashboard queries
*/

-- Add new columns to audit_logs table
DO $$
BEGIN
  -- Add user_agent column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
  END IF;

  -- Add ip_address column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN ip_address TEXT;
  END IF;

  -- Add session_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN session_id TEXT;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp ON audit_logs(action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_timestamp ON audit_logs(target_table, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);

-- Add composite index for common admin queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_queries ON audit_logs(timestamp DESC, action, user_id, target_table);

-- Update the existing indexes to be more efficient
DROP INDEX IF EXISTS idx_audit_logs_timestamp;
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_desc ON audit_logs(timestamp DESC);

-- Add a function to clean up old audit logs (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete audit logs older than 2 years
  DELETE FROM audit_logs 
  WHERE timestamp < NOW() - INTERVAL '2 years';
END;
$$;