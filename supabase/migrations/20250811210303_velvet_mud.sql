/*
  # Create consultant_country_assignments table

  1. New Tables
    - `consultant_country_assignments`
      - `id` (uuid, primary key)
      - `consultant_id` (uuid, foreign key to profiles)
      - `country_id` (uuid, foreign key to countries)
      - `is_primary` (boolean, default false)
      - `status` (text, default 'active')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `consultant_country_assignments` table
    - Add policies for consultants to view their assignments
    - Add policies for admins to manage all assignments

  3. Indexes
    - Add indexes for performance on consultant_id, country_id, and status
*/

CREATE TABLE IF NOT EXISTS consultant_country_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country_id uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultant_country_assignments_consultant_id 
  ON consultant_country_assignments(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_country_assignments_country_id 
  ON consultant_country_assignments(country_id);
CREATE INDEX IF NOT EXISTS idx_consultant_country_assignments_status 
  ON consultant_country_assignments(status);

-- Enable RLS
ALTER TABLE consultant_country_assignments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Consultants can view their assignments"
  ON consultant_country_assignments
  FOR SELECT
  TO authenticated
  USING (consultant_id = auth.uid());

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
  );

-- Insert sample assignment for Georgia consultant
INSERT INTO consultant_country_assignments (consultant_id, country_id, is_primary, status)
SELECT 
  p.id as consultant_id,
  c.id as country_id,
  true as is_primary,
  'active' as status
FROM profiles p
CROSS JOIN countries c
WHERE p.email = 'georgia@consulting19.com'
  AND c.slug = 'georgia'
ON CONFLICT DO NOTHING;