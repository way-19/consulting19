/*
  # Client Panel Enhancements - Comprehensive Update

  ## New Tables
  - `service_requests` - Custom service requests from clients
  - `client_recommendations` - AI-generated recommendations for clients
  - `onboarding_templates` - Consultant-defined onboarding workflows
  - `client_onboarding_progress` - Track client onboarding progress
  - `consultant_knowledge_base` - Internal knowledge sharing for consultants
  - `client_report_configs` - Automated report configurations
  - `generated_reports` - Generated client reports
  - `time_entries` - Enhanced time tracking for consultants

  ## Table Enhancements
  - Add `industry` column to `clients` table
  - Add shipping fields to `virtual_mailbox_items` table
  - Add `billable` field to time tracking

  ## Security
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
    CREATE INDEX IF NOT EXISTS idx_clients_industry ON clients(industry);
  END IF;
END $$;

-- Add shipping fields to virtual_mailbox_items table
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
  requested_service_type text DEFAULT 'custom',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'completed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget_range text,
  preferred_timeline text,
  notes text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for service_requests
CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_consultant_id ON service_requests(consultant_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_priority ON service_requests(priority);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at);

-- Enable RLS for service_requests
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_requests
CREATE POLICY "Clients can view their own requests"
  ON service_requests
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Clients can create their own requests"
  ON service_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Consultants can view assigned requests"
  ON service_requests
  FOR SELECT
  TO authenticated
  USING (consultant_id = auth.uid() OR client_id IN (
    SELECT id FROM clients WHERE assigned_consultant_id = auth.uid()
  ));

CREATE POLICY "Consultants can update assigned requests"
  ON service_requests
  FOR UPDATE
  TO authenticated
  USING (consultant_id = auth.uid() OR client_id IN (
    SELECT id FROM clients WHERE assigned_consultant_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create client_recommendations table
CREATE TABLE IF NOT EXISTS client_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL,
  title text NOT NULL,
  description text,
  action_url text,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read boolean DEFAULT false,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  generated_by text DEFAULT 'system',
  generated_at timestamptz DEFAULT now()
);

-- Create indexes for client_recommendations
CREATE INDEX IF NOT EXISTS idx_client_recommendations_client_id ON client_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_type ON client_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_active ON client_recommendations(is_active);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_read ON client_recommendations(is_read);

-- Enable RLS for client_recommendations
ALTER TABLE client_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_recommendations
CREATE POLICY "Clients can view their own recommendations"
  ON client_recommendations
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Clients can update their own recommendations"
  ON client_recommendations
  FOR UPDATE
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Consultants can manage client recommendations"
  ON client_recommendations
  FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE assigned_consultant_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all recommendations"
  ON client_recommendations
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create onboarding_templates table
CREATE TABLE IF NOT EXISTS onboarding_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  steps jsonb DEFAULT '[]'::jsonb,
  estimated_duration_days integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for onboarding_templates
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_consultant_id ON onboarding_templates(consultant_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_active ON onboarding_templates(is_active);

-- Enable RLS for onboarding_templates
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding_templates
CREATE POLICY "Consultants can manage their templates"
  ON onboarding_templates
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid());

CREATE POLICY "Admins can manage all templates"
  ON onboarding_templates
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create client_onboarding_progress table
CREATE TABLE IF NOT EXISTS client_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  current_step integer DEFAULT 0,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for client_onboarding_progress
CREATE INDEX IF NOT EXISTS idx_client_onboarding_progress_client_id ON client_onboarding_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_progress_template_id ON client_onboarding_progress(template_id);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_progress_status ON client_onboarding_progress(status);

-- Enable RLS for client_onboarding_progress
ALTER TABLE client_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_onboarding_progress
CREATE POLICY "Clients can view their onboarding progress"
  ON client_onboarding_progress
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Consultants can manage client onboarding"
  ON client_onboarding_progress
  FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE assigned_consultant_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all onboarding"
  ON client_onboarding_progress
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create consultant_knowledge_base table
CREATE TABLE IF NOT EXISTS consultant_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  country_specific text,
  language_code text DEFAULT 'en',
  views_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for consultant_knowledge_base
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_author_id ON consultant_knowledge_base(author_id);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_category ON consultant_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_public ON consultant_knowledge_base(is_public);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_country ON consultant_knowledge_base(country_specific);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_language ON consultant_knowledge_base(language_code);

-- Enable RLS for consultant_knowledge_base
ALTER TABLE consultant_knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS policies for consultant_knowledge_base
CREATE POLICY "Authors can manage their articles"
  ON consultant_knowledge_base
  FOR ALL
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Consultants can view public articles"
  ON consultant_knowledge_base
  FOR SELECT
  TO authenticated
  USING (is_public = true AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('consultant', 'admin')
  ));

CREATE POLICY "Admins can manage all articles"
  ON consultant_knowledge_base
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create client_report_configs table
CREATE TABLE IF NOT EXISTS client_report_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  config_data jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_generated_at timestamptz,
  next_generation_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for client_report_configs
CREATE INDEX IF NOT EXISTS idx_client_report_configs_client_id ON client_report_configs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_report_configs_consultant_id ON client_report_configs(consultant_id);
CREATE INDEX IF NOT EXISTS idx_client_report_configs_active ON client_report_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_client_report_configs_next_generation ON client_report_configs(next_generation_at);

-- Enable RLS for client_report_configs
ALTER TABLE client_report_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_report_configs
CREATE POLICY "Clients can view their report configs"
  ON client_report_configs
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Consultants can manage client report configs"
  ON client_report_configs
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid());

CREATE POLICY "Admins can manage all report configs"
  ON client_report_configs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create generated_reports table
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  config_id uuid REFERENCES client_report_configs(id) ON DELETE SET NULL,
  report_type text NOT NULL,
  title text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  file_url text,
  status text DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'viewed', 'downloaded')),
  period_start date,
  period_end date,
  generated_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  viewed_at timestamptz,
  downloaded_at timestamptz
);

-- Create indexes for generated_reports
CREATE INDEX IF NOT EXISTS idx_generated_reports_client_id ON generated_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_consultant_id ON generated_reports(consultant_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_config_id ON generated_reports(config_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_status ON generated_reports(status);
CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_at ON generated_reports(generated_at);

-- Enable RLS for generated_reports
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for generated_reports
CREATE POLICY "Clients can view their reports"
  ON generated_reports
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Clients can update their report status"
  ON generated_reports
  FOR UPDATE
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Consultants can manage client reports"
  ON generated_reports
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid());

CREATE POLICY "Admins can manage all reports"
  ON generated_reports
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create time_entries table (if not exists)
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  description text,
  date date DEFAULT CURRENT_DATE,
  billable boolean DEFAULT true,
  hourly_rate numeric(10,2),
  total_amount numeric(10,2),
  status text DEFAULT 'logged' CHECK (status IN ('logged', 'approved', 'invoiced', 'paid')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for time_entries
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_consultant_id ON time_entries(consultant_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_billable ON time_entries(billable);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);

-- Enable RLS for time_entries
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for time_entries
CREATE POLICY "Consultants can manage their time entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid());

CREATE POLICY "Clients can view their time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all time entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Add updated_at triggers for new tables
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_service_requests_updated_at'
  ) THEN
    CREATE TRIGGER handle_service_requests_updated_at
      BEFORE UPDATE ON service_requests
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_onboarding_templates_updated_at'
  ) THEN
    CREATE TRIGGER handle_onboarding_templates_updated_at
      BEFORE UPDATE ON onboarding_templates
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_client_onboarding_progress_updated_at'
  ) THEN
    CREATE TRIGGER handle_client_onboarding_progress_updated_at
      BEFORE UPDATE ON client_onboarding_progress
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_consultant_knowledge_base_updated_at'
  ) THEN
    CREATE TRIGGER handle_consultant_knowledge_base_updated_at
      BEFORE UPDATE ON consultant_knowledge_base
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_client_report_configs_updated_at'
  ) THEN
    CREATE TRIGGER handle_client_report_configs_updated_at
      BEFORE UPDATE ON client_report_configs
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_time_entries_updated_at'
  ) THEN
    CREATE TRIGGER handle_time_entries_updated_at
      BEFORE UPDATE ON time_entries
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;