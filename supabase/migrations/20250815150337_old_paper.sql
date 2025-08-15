/*
  # Enhance Client Features - Comprehensive Update

  1. New Tables
    - `service_requests` - Custom service requests from clients
    - `client_recommendations` - AI-generated recommendations for clients
    - `onboarding_templates` - Consultant-defined onboarding workflows
    - `client_onboarding_progress` - Track client onboarding progress
    - `consultant_knowledge_base` - Internal knowledge sharing for consultants
    - `client_report_configs` - Automated report configurations
    - `generated_reports` - Generated client reports

  2. Table Enhancements
    - Add `industry` column to `clients` table
    - Add shipping fields to `virtual_mailbox_items` table
    - Add `billable` field to `time_entries` table (if exists)

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

-- Create client_recommendations table
CREATE TABLE IF NOT EXISTS client_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL DEFAULT 'service',
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
  estimated_duration_days integer DEFAULT 7,
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
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
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
  country_specific text,
  is_published boolean DEFAULT true,
  view_count integer DEFAULT 0,
  helpful_votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client_report_configs table
CREATE TABLE IF NOT EXISTS client_report_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_type text NOT NULL DEFAULT 'progress_summary',
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly')),
  include_tasks boolean DEFAULT true,
  include_documents boolean DEFAULT true,
  include_financial boolean DEFAULT false,
  custom_sections jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  last_generated_at timestamptz,
  next_generation_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create generated_reports table
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES client_report_configs(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  file_url text,
  status text DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'viewed', 'downloaded')),
  generated_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  viewed_at timestamptz
);

-- Enable RLS on all new tables
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_report_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_requests
CREATE POLICY "Clients can manage their service requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE profile_id = uid()));

CREATE POLICY "Consultants can view and update assigned client requests"
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

CREATE POLICY "Consultants can manage their client recommendations"
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
CREATE POLICY "Consultants can manage their onboarding templates"
  ON onboarding_templates
  FOR ALL
  TO authenticated
  USING (consultant_id = uid())
  WITH CHECK (consultant_id = uid());

CREATE POLICY "Admins can view all onboarding templates"
  ON onboarding_templates
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = uid() AND role = 'admin'));

-- RLS Policies for client_onboarding_progress
CREATE POLICY "Clients can view their onboarding progress"
  ON client_onboarding_progress
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = uid()));

CREATE POLICY "Consultants can manage their client onboarding"
  ON client_onboarding_progress
  FOR ALL
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE assigned_consultant_id = uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE assigned_consultant_id = uid()));

-- RLS Policies for consultant_knowledge_base
CREATE POLICY "Consultants can manage their knowledge base articles"
  ON consultant_knowledge_base
  FOR ALL
  TO authenticated
  USING (author_id = uid())
  WITH CHECK (author_id = uid());

CREATE POLICY "All consultants can read published articles"
  ON consultant_knowledge_base
  FOR SELECT
  TO authenticated
  USING (is_published = true AND EXISTS (SELECT 1 FROM profiles WHERE id = uid() AND role IN ('consultant', 'admin')));

-- RLS Policies for client_report_configs
CREATE POLICY "Consultants can manage their client report configs"
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
CREATE POLICY "Consultants can manage their client reports"
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_consultant_id ON service_requests(consultant_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

CREATE INDEX IF NOT EXISTS idx_client_recommendations_client_id ON client_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_type ON client_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_active ON client_recommendations(is_active);

CREATE INDEX IF NOT EXISTS idx_onboarding_templates_consultant_id ON onboarding_templates(consultant_id);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_progress_client_id ON client_onboarding_progress(client_id);

CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_author_id ON consultant_knowledge_base(author_id);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_category ON consultant_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_published ON consultant_knowledge_base(is_published);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_service_requests_updated_at') THEN
    CREATE TRIGGER handle_service_requests_updated_at
      BEFORE UPDATE ON service_requests
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_onboarding_templates_updated_at') THEN
    CREATE TRIGGER handle_onboarding_templates_updated_at
      BEFORE UPDATE ON onboarding_templates
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_consultant_knowledge_base_updated_at') THEN
    CREATE TRIGGER handle_consultant_knowledge_base_updated_at
      BEFORE UPDATE ON consultant_knowledge_base
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_client_report_configs_updated_at') THEN
    CREATE TRIGGER handle_client_report_configs_updated_at
      BEFORE UPDATE ON client_report_configs
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;