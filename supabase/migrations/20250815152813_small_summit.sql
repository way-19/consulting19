/*
  # Client Panel Enhancements - Comprehensive Update

  ## New Tables
  1. service_requests - Custom service requests from clients
  2. client_recommendations - AI-generated recommendations for clients  
  3. onboarding_templates - Consultant-defined onboarding workflows
  4. client_onboarding_progress - Track client onboarding progress
  5. consultant_knowledge_base - Internal knowledge sharing for consultants
  6. client_report_configs - Automated report configurations
  7. generated_reports - Generated client reports
  8. time_entries - Enhanced time tracking for consultants

  ## Table Enhancements
  - Add industry column to clients table
  - Add shipping fields to virtual_mailbox_items table
  - Add billable field to time_entries table

  ## Security
  - Enable RLS on all new tables
  - Add appropriate policies for each user role
*/

-- Add industry column to existing clients table
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

-- Create time_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL DEFAULT 0,
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  billable boolean DEFAULT true,
  hourly_rate numeric(10,2),
  total_amount numeric(10,2),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'invoiced')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  requested_service_type text NOT NULL DEFAULT 'custom',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'completed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget_range text,
  preferred_timeline text,
  notes text,
  admin_notes text,
  estimated_price numeric(10,2),
  approved_price numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client_recommendations table
CREATE TABLE IF NOT EXISTS client_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
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
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_duration_days integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client_onboarding_progress table
CREATE TABLE IF NOT EXISTS client_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  template_id uuid REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  current_step integer DEFAULT 0,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  step_notes jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create consultant_knowledge_base table
CREATE TABLE IF NOT EXISTS consultant_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  country_specific text,
  language_code text DEFAULT 'en',
  views_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client_report_configs table
CREATE TABLE IF NOT EXISTS client_report_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  config_data jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_generated_at timestamptz,
  next_generation_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create generated_reports table
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  config_id uuid REFERENCES client_report_configs(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  period_start date,
  period_end date,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  file_url text,
  status text DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'viewed', 'downloaded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_report_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_entries
CREATE POLICY "Consultants can manage their time entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (consultant_id = uid())
  WITH CHECK (consultant_id = uid());

CREATE POLICY "Clients can view their time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT clients.id FROM clients WHERE clients.profile_id = uid()
  ));

CREATE POLICY "Admins can manage all time entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for service_requests
CREATE POLICY "Clients can manage their service requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT clients.id FROM clients WHERE clients.profile_id = uid()
  ))
  WITH CHECK (client_id IN (
    SELECT clients.id FROM clients WHERE clients.profile_id = uid()
  ));

CREATE POLICY "Consultants can view and update assigned requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (consultant_id = uid())
  WITH CHECK (consultant_id = uid());

CREATE POLICY "Admins can manage all service requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for client_recommendations
CREATE POLICY "Clients can view their recommendations"
  ON client_recommendations
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT clients.id FROM clients WHERE clients.profile_id = uid()
  ));

CREATE POLICY "Clients can update read status"
  ON client_recommendations
  FOR UPDATE
  TO authenticated
  USING (client_id IN (
    SELECT clients.id FROM clients WHERE clients.profile_id = uid()
  ))
  WITH CHECK (client_id IN (
    SELECT clients.id FROM clients WHERE clients.profile_id = uid()
  ));

CREATE POLICY "Consultants can manage recommendations for their clients"
  ON client_recommendations
  FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT clients.id FROM clients WHERE clients.assigned_consultant_id = uid()
  ))
  WITH CHECK (client_id IN (
    SELECT clients.id FROM clients WHERE clients.assigned_consultant_id = uid()
  ));

CREATE POLICY "Admins can manage all recommendations"
  ON client_recommendations
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

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
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for client_onboarding_progress
CREATE POLICY "Clients can view their onboarding progress"
  ON client_onboarding_progress
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT clients.id FROM clients WHERE clients.profile_id = uid()
  ));

CREATE POLICY "Consultants can manage their clients' onboarding"
  ON client_onboarding_progress
  FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT clients.id FROM clients WHERE clients.assigned_consultant_id = uid()
  ))
  WITH CHECK (client_id IN (
    SELECT clients.id FROM clients WHERE clients.assigned_consultant_id = uid()
  ));

CREATE POLICY "Admins can manage all onboarding progress"
  ON client_onboarding_progress
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for consultant_knowledge_base
CREATE POLICY "Consultants can manage their knowledge base"
  ON consultant_knowledge_base
  FOR ALL
  TO authenticated
  USING (author_id = uid())
  WITH CHECK (author_id = uid());

CREATE POLICY "All consultants can read public knowledge"
  ON consultant_knowledge_base
  FOR SELECT
  TO authenticated
  USING (is_public = true AND EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = uid() AND profiles.role IN ('consultant', 'admin')
  ));

CREATE POLICY "Admins can manage all knowledge base"
  ON consultant_knowledge_base
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

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
  USING (client_id IN (
    SELECT clients.id FROM clients WHERE clients.profile_id = uid()
  ));

CREATE POLICY "Admins can manage all report configs"
  ON client_report_configs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

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
  USING (client_id IN (
    SELECT clients.id FROM clients WHERE clients.profile_id = uid()
  ));

CREATE POLICY "Admins can manage all reports"
  ON generated_reports
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_consultant_id ON service_requests(consultant_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_client_recommendations_client_id ON client_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_is_read ON client_recommendations(is_read);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_is_active ON client_recommendations(is_active);
CREATE INDEX IF NOT EXISTS idx_client_recommendations_generated_at ON client_recommendations(generated_at);

CREATE INDEX IF NOT EXISTS idx_time_entries_consultant_id ON time_entries(consultant_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_billable ON time_entries(billable);

CREATE INDEX IF NOT EXISTS idx_onboarding_templates_consultant_id ON onboarding_templates(consultant_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_is_active ON onboarding_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_client_onboarding_progress_client_id ON client_onboarding_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_progress_template_id ON client_onboarding_progress(template_id);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_progress_status ON client_onboarding_progress(status);

CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_author_id ON consultant_knowledge_base(author_id);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_category ON consultant_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_is_public ON consultant_knowledge_base(is_public);
CREATE INDEX IF NOT EXISTS idx_consultant_knowledge_base_country_specific ON consultant_knowledge_base(country_specific);

CREATE INDEX IF NOT EXISTS idx_client_report_configs_client_id ON client_report_configs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_report_configs_consultant_id ON client_report_configs(consultant_id);
CREATE INDEX IF NOT EXISTS idx_client_report_configs_is_active ON client_report_configs(is_active);

CREATE INDEX IF NOT EXISTS idx_generated_reports_client_id ON generated_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_consultant_id ON generated_reports(consultant_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_config_id ON generated_reports(config_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_created_at ON generated_reports(created_at);

-- Add updated_at triggers for new tables
CREATE TRIGGER handle_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_client_recommendations_updated_at
  BEFORE UPDATE ON client_recommendations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_onboarding_templates_updated_at
  BEFORE UPDATE ON onboarding_templates
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_client_onboarding_progress_updated_at
  BEFORE UPDATE ON client_onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_consultant_knowledge_base_updated_at
  BEFORE UPDATE ON consultant_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_client_report_configs_updated_at
  BEFORE UPDATE ON client_report_configs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_generated_reports_updated_at
  BEFORE UPDATE ON generated_reports
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert sample onboarding template for Georgia consultant
INSERT INTO onboarding_templates (consultant_id, name, description, steps, estimated_duration_days) VALUES
(
  '3732cae6-3238-44b6-9c6b-2f29f0216a83', -- Georgia consultant ID
  'Georgia Company Formation Onboarding',
  'Complete onboarding process for Georgia company formation clients',
  '[
    {
      "step": 1,
      "title": "Initial Consultation",
      "description": "Welcome call and requirement gathering",
      "estimated_days": 1,
      "required_documents": [],
      "tasks": ["Schedule welcome call", "Gather business requirements", "Explain process"]
    },
    {
      "step": 2,
      "title": "Document Collection",
      "description": "Collect all required documents from client",
      "estimated_days": 3,
      "required_documents": ["Passport copy", "Proof of address", "Business plan"],
      "tasks": ["Send document checklist", "Review submitted documents", "Request missing documents"]
    },
    {
      "step": 3,
      "title": "Company Registration",
      "description": "Submit company registration application",
      "estimated_days": 5,
      "required_documents": [],
      "tasks": ["Prepare registration documents", "Submit to authorities", "Track application status"]
    },
    {
      "step": 4,
      "title": "Bank Account Setup",
      "description": "Assist with bank account opening",
      "estimated_days": 7,
      "required_documents": ["Company certificate", "Director ID"],
      "tasks": ["Schedule bank appointment", "Prepare banking documents", "Accompany to bank"]
    },
    {
      "step": 5,
      "title": "Tax Registration",
      "description": "Complete tax registration and compliance setup",
      "estimated_days": 3,
      "required_documents": [],
      "tasks": ["Register for taxes", "Set up accounting", "Provide tax guidance"]
    },
    {
      "step": 6,
      "title": "Final Handover",
      "description": "Complete handover and ongoing support setup",
      "estimated_days": 1,
      "required_documents": [],
      "tasks": ["Deliver all documents", "Explain ongoing obligations", "Set up support channels"]
    }
  ]'::jsonb,
  20
);

-- Insert sample client recommendations
INSERT INTO client_recommendations (client_id, recommendation_type, title, description, action_url, priority) VALUES
(
  (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com') LIMIT 1),
  'service',
  'Georgia Tax Residency Certificate',
  'Based on your company formation, you may benefit from Georgian tax residency for 0% tax on foreign income.',
  '/countries/georgia/services/tax-residency',
  'high'
),
(
  (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com') LIMIT 1),
  'blog_post',
  'New Banking Regulations in Georgia',
  'Important updates about banking requirements that may affect your business operations.',
  '/blog/georgia-banking-updates-2025',
  'normal'
),
(
  (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com') LIMIT 1),
  'certificate',
  'Apostille Service for International Use',
  'Get your Georgian company documents apostilled for international recognition.',
  '/services/apostille-service',
  'normal'
);

-- Insert sample report config
INSERT INTO client_report_configs (client_id, consultant_id, report_type, frequency, config_data) VALUES
(
  (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com') LIMIT 1),
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',
  'monthly_progress',
  'monthly',
  '{
    "include_tasks": true,
    "include_documents": true,
    "include_financial": true,
    "include_recommendations": true,
    "language": "en"
  }'::jsonb
);

-- Insert sample knowledge base entries
INSERT INTO consultant_knowledge_base (author_id, title, content, category, tags, is_public, country_specific) VALUES
(
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',
  'Georgia Company Formation Checklist',
  'Complete checklist for Georgia LLC formation including all required documents, steps, and timeline.',
  'company_formation',
  ARRAY['georgia', 'llc', 'checklist', 'documents'],
  true,
  'georgia'
),
(
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',
  'Georgian Banking Requirements 2025',
  'Updated banking requirements and procedures for opening business accounts in Georgia.',
  'banking',
  ARRAY['georgia', 'banking', 'requirements', '2025'],
  true,
  'georgia'
),
(
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',
  'Tax Optimization Strategies for Georgian Companies',
  'Advanced tax planning strategies for companies registered in Georgia.',
  'tax_planning',
  ARRAY['georgia', 'tax', 'optimization', 'planning'],
  false,
  'georgia'
);