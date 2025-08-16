/*
  # Add settings table for system configuration

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
    - Add policy for admins to manage all settings
    - Add policy for public to read public settings

  3. Initial Data
    - Insert default system settings
*/

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb DEFAULT '{}'::jsonb,
  description text,
  category text DEFAULT 'general'::text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all settings"
  ON settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = uid() 
      AND profiles.legacy_role = 'admin'
    )
  );

CREATE POLICY "Public can read public settings"
  ON settings
  FOR SELECT
  TO public
  USING (is_public = true);

-- Create updated_at trigger
CREATE TRIGGER handle_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert default settings
INSERT INTO settings (key, value, description, category, is_public) VALUES
  ('commission_rates', '{"consultant": 0.65, "platform": 0.35}'::jsonb, 'Commission split between consultant and platform', 'financial', false),
  ('default_currency', '"USD"'::jsonb, 'Default currency for the platform', 'financial', true),
  ('notification_settings', '{"email_enabled": true, "sms_enabled": false, "push_enabled": true}'::jsonb, 'Global notification preferences', 'notifications', false),
  ('onboarding_enabled', 'true'::jsonb, 'Enable client onboarding workflow', 'general', false),
  ('max_file_size_mb', '50'::jsonb, 'Maximum file upload size in MB', 'general', true),
  ('auto_assign_consultants', 'true'::jsonb, 'Automatically assign consultants to new clients', 'general', false),
  ('require_document_approval', 'true'::jsonb, 'Require document approval workflow', 'general', false),
  ('enable_multilingual_chat', 'true'::jsonb, 'Enable multilingual chat with auto-translation', 'general', true),
  ('default_language', '"en"'::jsonb, 'Default platform language', 'general', true),
  ('supported_languages', '["en", "tr", "ka", "ru"]'::jsonb, 'Supported platform languages', 'general', true),
  ('maintenance_mode', 'false'::jsonb, 'Enable maintenance mode', 'general', false)
ON CONFLICT (key) DO NOTHING;