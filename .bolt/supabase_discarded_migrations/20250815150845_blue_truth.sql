/*
  # Client Panel Enhancements

  1. New Tables
    - `service_requests` - Customer service requests
    - `client_recommendations` - AI-generated recommendations for clients
    - `onboarding_templates` - Consultant onboarding workflows
    - `client_onboarding_progress` - Client onboarding progress tracking
    - `consultant_knowledge_base` - Internal consultant knowledge sharing
    - `client_report_configs` - Automated report configurations
    - `generated_reports` - Generated client reports
    - `time_entries` - Enhanced time tracking for consultants

  2. Table Modifications
    - Add `industry` column to `clients` table
    - Add `billable` column to existing time tracking
    - Add shipping options to `virtual_mailbox_items`

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

-- Add shipping columns to virtual_mailbox_items
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

-- Create onboarding_templates table
CREATE TABLE IF NOT EXISTS onboarding_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  steps jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client_onboarding_progress table
CREATE TABLE IF NOT EXISTS client_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  current_step integer DEFAULT 0,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  notes text
);

-- Create consultant_knowledge_base table
CREATE TABLE IF NOT EXISTS consultant_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  country_specific uuid REFERENCES countries(id) ON DELETE SET NULL,
  is_published boolean DEFAULT false,
  access_level text DEFAULT 'all_consultants' CHECK (access_level IN ('all_consultants', 'country_specific', 'private')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client_report_configs table
CREATE TABLE IF NOT EXISTS client_report_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_type text DEFAULT 'progress_summary',
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly')),
  is_active boolean DEFAULT true,
  last_generated_at timestamptz,
  next_generation_at timestamptz,
  template_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create generated_reports table
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES client_report_configs(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_data jsonb NOT NULL,
  file_url text,
  status text DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'viewed')),
  generated_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  viewed_at timestamptz
);

-- Create time_entries table for enhanced time tracking
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  description text,
  billable boolean DEFAULT true,
  hourly_rate numeric(10,2),
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_report_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_requests
CREATE POLICY "Clients can manage their service requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE profile_id = uid()));

CREATE POLICY "Consultants can view and update assigned requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (consultant_id = uid() OR client_id IN (SELECT id FROM clients WHERE assigned_consultant_id = uid()))
  WITH CHECK (consultant_id = uid() OR client_id IN (SELECT id FROM clients WHERE assigned_consultant_id = uid()));

CREATE POLICY "Admins can manage all service requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = uid() AND role = 'admin'));

-- RLS Policies for client_recommendations
CREATE POLICY "Clients can view their recommendations"
  ON client_recommendations
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = uid()));

CREATE POLICY "Clients can update read status"
  ON client_recommendations
  FOR UPDATE
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE profile_id = uid()));

CREATE POLICY "Consultants can manage client recommendations"
  ON client_recommendations
  FOR ALL
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE assigned_consultant_id = uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE assigned_consultant_id = uid()));

CREATE POLICY "System can create recommendations"
  ON client_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for onboarding_templates
CREATE POLICY "Consultants can manage their templates"
  ON onboarding_templates
  FOR ALL
  TO authenticated
  USING (consultant_id = uid())
  WITH CHECK (consultant_id = uid());

CREATE POLICY "Admins can manage all templates"
  ON onboarding_templates
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = uid() AND role = 'admin'));

-- RLS Policies for client_onboarding_progress
CREATE POLICY "Clients can view their onboarding progress"
  ON client_onboarding_progress
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = uid()));

CREATE POLICY "Consultants can manage client onboarding"
  ON client_onboarding_progress
  FOR ALL
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE assigned_consultant_id = uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE assigned_consultant_id = uid()));

-- RLS Policies for consultant_knowledge_base
CREATE POLICY "Consultants can view published articles"
  ON consultant_knowledge_base
  FOR SELECT
  TO authenticated
  USING (is_published = true AND EXISTS (SELECT 1 FROM profiles WHERE id = uid() AND role IN ('consultant', 'admin')));

CREATE POLICY "Authors can manage their articles"
  ON consultant_knowledge_base
  FOR ALL
  TO authenticated
  USING (author_id = uid())
  WITH CHECK (author_id = uid());

CREATE POLICY "Admins can manage all articles"
  ON consultant_knowledge_base
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = uid() AND role = 'admin'));

-- RLS Policies for client_report_configs
CREATE POLICY "Consultants can manage their client reports"
  ON client_report_configs
  FOR ALL
  TO authenticated
  USING (consultant_id = uid())
  WITH CHECK (consultant_id = uid());

CREATE POLICY "Clients can view their report configs"
  ON client_report_configs
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = uid()));

-- RLS Policies for generated_reports
CREATE POLICY "Consultants can manage their generated reports"
  ON generated_reports
  FOR ALL
  TO authenticated
  USING (consultant_id = uid())
  WITH CHECK (consultant_id = uid());

CREATE POLICY "Clients can view their reports"
  ON generated_reports
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = uid()));

-- RLS Policies for time_entries
CREATE POLICY "Consultants can manage their time entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (consultant_id = uid())
  WITH CHECK (consultant_id = uid());

CREATE POLICY "Clients can view billable time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (billable = true AND client_id IN (SELECT id FROM clients WHERE profile_id = uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_consultant_id ON service_requests(consultant_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

CREATE INDEX IF NOT EXISTS idx_client_recommendations_client_id ON client_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_is_read ON client_recommendations(is_read);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_is_active ON client_recommendations(is_active);

CREATE INDEX IF NOT EXISTS idx_onboarding_templates_consultant_id ON onboarding_templates(consultant_id);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_progress_client_id ON client_onboarding_progress(client_id);

CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_author_id ON consultant_knowledge_base(author_id);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_category ON consultant_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_published ON consultant_knowledge_base(is_published);

CREATE INDEX IF NOT EXISTS idx_time_entries_consultant_id ON time_entries(consultant_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_billable ON time_entries(billable);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);

-- Add updated_at triggers for new tables
CREATE TRIGGER handle_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_onboarding_templates_updated_at
  BEFORE UPDATE ON onboarding_templates
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_client_report_configs_updated_at
  BEFORE UPDATE ON client_report_configs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert sample data for testing
INSERT INTO client_recommendations (client_id, recommendation_type, title, description, action_url, priority)
SELECT 
  c.id,
  'service',
  'Recommended: Tax Residency Certificate',
  'Based on your business type, we recommend obtaining a tax residency certificate for additional benefits.',
  '/services/tax-residency',
  'normal'
FROM clients c
WHERE c.service_type = 'company_formation'
ON CONFLICT DO NOTHING;

INSERT INTO client_recommendations (client_id, recommendation_type, title, description, action_url, priority)
SELECT 
  c.id,
  'certificate',
  'Industry-Specific Certification Available',
  'Special certifications are available for your industry sector. This can enhance your business credibility.',
  '/services/certification',
  'normal'
FROM clients c
WHERE c.industry IS NOT NULL
ON CONFLICT DO NOTHING;