/*
  # Enhance Audit Logs with IP Address and User Agent

  1. New Columns
    - `ip_address` (text) - IP address of the user making the action
    - `user_agent` (text) - Browser/device information

  2. Security
    - Maintain existing RLS policies
    - Add indexes for better performance
*/

-- Add new columns to audit_logs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN ip_address text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_agent text;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_agent ON audit_logs(user_agent);

-- Add index for better timestamp filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_desc ON audit_logs(timestamp DESC);