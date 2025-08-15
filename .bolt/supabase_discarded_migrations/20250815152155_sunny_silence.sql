/*
  # Client Panel Enhancements

  1. New Tables
    - `service_requests` - Custom service requests from clients
    - `client_recommendations` - AI-generated recommendations for clients
    - `onboarding_templates` - Consultant onboarding workflows
    - `client_onboarding_progress` - Client onboarding progress tracking
    - `time_entries` - Detailed time tracking for tasks
    - `consultant_knowledge_base` - Internal knowledge sharing

  2. Table Updates
    - Add `industry` column to `clients` table
    - Add shipping fields to `virtual_mailbox_items` table

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each user role
*/

-- Add industry column to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'industry'
  ) THEN
    ALTER TABLE clients ADD COLUMN industry text;
  END IF;
END $$;

-- Add shipping fields to virtual_mailbox_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'virtual_mailbox_items' AND column_name = 'shipping_option'
  ) THEN
    ALTER TABLE virtual_mailbox_items ADD COLUMN shipping_option text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'virtual_mailbox_items' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE virtual_mailbox_items ADD COLUMN shipping_address jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  requested_service_type text NOT NULL DEFAULT 'custom',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget_range text,
  preferred_timeline text,
  notes text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_requests
CREATE POLICY "Clients can manage their service requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = uid()
  ))
  WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE profile_id = uid()
  ));

CREATE POLICY "Consultants can view and update assigned requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (consultant_id = uid() OR client_id IN (
    SELECT id FROM clients WHERE assigned_consultant_id = uid()
  ))
  WITH CHECK (consultant_id = uid() OR client_id IN (
    SELECT id FROM clients WHERE assigned_consultant_id = uid()
  ));

CREATE POLICY "Admins can manage all service requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = uid() AND role = 'admin'
  ));

-- Create client_recommendations table
CREATE TABLE IF NOT EXISTS client_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL DEFAULT 'service',
  title text NOT NULL,
  description text,
  action_url text,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read boolean DEFAULT false,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  generated_by text NOT NULL DEFAULT 'system',
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE client_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_recommendations
CREATE POLICY "Clients can view their recommendations"
  ON client_recommendations
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = uid()
  ));

CREATE POLICY "Clients can update their recommendations"
  ON client_recommendations
  FOR UPDATE
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = uid()
  ))
  WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE profile_id = uid()
  ));

CREATE POLICY "Consultants can manage client recommendations"
  ON client_recommendations
  FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE assigned_consultant_id = uid()
  ))
  WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE assigned_consultant_id = uid()
  ));

-- Create onboarding_templates table
CREATE TABLE IF NOT EXISTS onboarding_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  service_type text NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_duration_days integer DEFAULT 14,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding_templates
CREATE POLICY "Consultants can manage their templates"
  ON onboarding_templates
  FOR ALL
  TO authenticated
  USING (consultant_id = uid())
  WITH CHECK (consultant_id = uid());

-- Create client_onboarding_progress table
CREATE TABLE IF NOT EXISTS client_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  current_step integer DEFAULT 0,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  notes text
);

ALTER TABLE client_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_onboarding_progress
CREATE POLICY "Clients can view their onboarding progress"
  ON client_onboarding_progress
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = uid()
  ));

CREATE POLICY "Consultants can manage client onboarding"
  ON client_onboarding_progress
  FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE assigned_consultant_id = uid()
  ))
  WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE assigned_consultant_id = uid()
  ));

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  description text,
  billable boolean DEFAULT true,
  hourly_rate numeric(10,2),
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for time_entries
CREATE POLICY "Consultants can manage their time entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (consultant_id = uid())
  WITH CHECK (consultant_id = uid());

CREATE POLICY "Clients can view time entries for their tasks"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (task_id IN (
    SELECT t.id FROM tasks t
    JOIN clients c ON t.client_id = c.id
    WHERE c.profile_id = uid()
  ));

-- Create consultant_knowledge_base table
CREATE TABLE IF NOT EXISTS consultant_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  tags text[] DEFAULT '{}',
  country_specific text,
  is_published boolean DEFAULT false,
  access_level text NOT NULL DEFAULT 'all_consultants' CHECK (access_level IN ('all_consultants', 'country_specific', 'private')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consultant_knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS policies for consultant_knowledge_base
CREATE POLICY "Consultants can view published knowledge base"
  ON consultant_knowledge_base
  FOR SELECT
  TO authenticated
  USING (
    is_published = true AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = uid() AND role = 'consultant')
  );

CREATE POLICY "Authors can manage their own articles"
  ON consultant_knowledge_base
  FOR ALL
  TO authenticated
  USING (author_id = uid())
  WITH CHECK (author_id = uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_consultant_id ON service_requests(consultant_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

CREATE INDEX IF NOT EXISTS idx_client_recommendations_client_id ON client_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_active ON client_recommendations(is_active);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_read ON client_recommendations(is_read);

CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_consultant_id ON time_entries(consultant_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_billable ON time_entries(billable);

CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_author ON consultant_knowledge_base(author_id);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_category ON consultant_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_published ON consultant_knowledge_base(is_published);

-- Add updated_at triggers
CREATE TRIGGER handle_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_onboarding_templates_updated_at
  BEFORE UPDATE ON onboarding_templates
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_consultant_knowledge_base_updated_at
  BEFORE UPDATE ON consultant_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();