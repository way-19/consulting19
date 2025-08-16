/*
  # Add settings table and fix audit_logs policies

  1. New Tables
    - `settings`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (jsonb)
      - `description` (text)
      - `category` (text)
      - `is_public` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `settings` table
    - Add policies for admin access only

  3. Fixes
    - Fix audit_logs policies to use auth.uid() instead of uid()
*/

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb DEFAULT '{}',
  description text,
  category text DEFAULT 'general',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Add policies for settings table
CREATE POLICY "Admins can manage all settings"
  ON settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.legacy_role = 'admin'
    )
  );

-- Fix audit_logs policies if they exist
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
  DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
  
  -- Create new policies with correct auth.uid() function
  CREATE POLICY "Admins can view all audit logs"
    ON audit_logs
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.legacy_role = 'admin'
      )
    );

  CREATE POLICY "System can insert audit logs"
    ON audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
EXCEPTION
  WHEN undefined_table THEN
    -- audit_logs table doesn't exist yet, skip policy creation
    NULL;
END $$;

-- Add updated_at trigger for settings
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert default settings
INSERT INTO settings (key, value, description, category, is_public) VALUES
  ('commission_rates', '{"consultant": 0.65, "platform": 0.35}', 'Commission split rates', 'financial', false),
  ('default_currency', '"USD"', 'Default platform currency', 'financial', true),
  ('max_file_size_mb', '50', 'Maximum file upload size in MB', 'general', false),
  ('onboarding_enabled', 'true', 'Enable client onboarding workflow', 'general', false),
  ('auto_assign_consultants', 'true', 'Auto-assign consultants to new clients', 'general', false),
  ('require_document_approval', 'true', 'Require document approval workflow', 'general', false),
  ('maintenance_mode', 'false', 'Enable maintenance mode', 'general', false),
  ('notification_settings', '{"email_enabled": true, "sms_enabled": false, "push_enabled": true}', 'Notification preferences', 'notifications', false),
  ('default_language', '"en"', 'Default platform language', 'general', true),
  ('supported_languages', '["en", "tr", "ka", "ru"]', 'Supported platform languages', 'general', true)
ON CONFLICT (key) DO NOTHING;