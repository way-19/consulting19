/*
  # Create projects table for project management

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `consultant_id` (uuid, foreign key to profiles)
      - `name` (text, project name)
      - `description` (text, optional)
      - `status` (text, project status)
      - `priority` (text, project priority)
      - `start_date` (timestamptz, optional)
      - `end_date` (timestamptz, optional)
      - `estimated_hours` (integer, optional)
      - `actual_hours` (numeric, default 0)
      - `budget` (numeric, optional)
      - `progress` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `projects` table
    - Add policies for consultants to manage their projects
    - Add policies for clients to view their projects
    - Add policies for admins to manage all projects

  3. Indexes
    - Add indexes for performance optimization
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date timestamptz,
  end_date timestamptz,
  estimated_hours integer CHECK (estimated_hours > 0),
  actual_hours numeric(10,2) NOT NULL DEFAULT 0 CHECK (actual_hours >= 0),
  budget numeric(10,2) CHECK (budget > 0),
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_consultant_id ON projects(consultant_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- RLS Policies

-- Consultants can manage their own projects
CREATE POLICY "Consultants can manage their projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

-- Clients can view their own projects
CREATE POLICY "Clients can view their projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  ));

-- Admins can manage all projects
CREATE POLICY "Admins can manage all projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();