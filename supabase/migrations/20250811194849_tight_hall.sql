/*
  # Create Countries Table

  1. New Tables
    - `countries` - Store country information for the platform
  
  2. Security
    - Public read access
    - Admin-only write access
*/

-- Create countries table if it doesn't exist
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  flag_emoji text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Public can read countries
DROP POLICY IF EXISTS "countries_public_read" ON countries;
CREATE POLICY "countries_public_read"
ON countries FOR SELECT
TO public
USING (true);

-- Only admins can modify countries
DROP POLICY IF EXISTS "countries_admin_all" ON countries;
CREATE POLICY "countries_admin_all"
ON countries FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS handle_countries_updated_at ON countries;
CREATE TRIGGER handle_countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();