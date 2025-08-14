/*
  # Complete Consulting19 System Setup

  This migration creates a comprehensive business consulting platform with:
  
  1. Enhanced User Management
    - RBAC system with roles and permissions
    - Audit logging for admin actions
    - User profiles with detailed information
  
  2. Advanced Project Management
    - Projects with tasks and time tracking
    - Document management with templates
    - Communication logs and satisfaction surveys
  
  3. Content Management System
    - Blog posts and FAQs
    - Static content management
    - Multi-language support
  
  4. Financial Management
    - Enhanced accounting and invoicing
    - Commission tracking and payments
    - Financial reporting
  
  5. System Administration
    - Settings management
    - Integration configurations
    - Notification system
  
  6. Knowledge Base
    - Articles and resources
    - Content review requests
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. RBAC System
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_system_role boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- 2. Enhanced Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role_id uuid REFERENCES roles(id),
  legacy_role text NOT NULL CHECK (legacy_role IN ('admin', 'consultant', 'client')),
  full_name text,
  phone text,
  country text,
  language_preference text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  avatar_url text,
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Countries
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  flag_emoji text,
  description text,
  image_url text,
  primary_language text DEFAULT 'en',
  supported_languages text[] DEFAULT ARRAY['en'],
  highlights text[] DEFAULT ARRAY[]::text[],
  tags text[] DEFAULT ARRAY[]::text[],
  insights jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Clients
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_consultant_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  company_name text,
  phone text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  service_type text DEFAULT 'company_formation',
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  segment text DEFAULT 'standard',
  tags text[] DEFAULT ARRAY[]::text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date date,
  end_date date,
  estimated_hours integer CHECK (estimated_hours > 0),
  actual_hours integer DEFAULT 0 CHECK (actual_hours >= 0),
  budget numeric(10,2),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  estimated_hours integer CHECK (estimated_hours > 0),
  actual_hours integer DEFAULT 0 CHECK (actual_hours >= 0),
  assigned_to uuid REFERENCES profiles(id),
  dependencies uuid[] DEFAULT ARRAY[]::uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL,
  category text DEFAULT 'other' CHECK (category IN ('identity', 'business', 'financial', 'legal', 'tax', 'other')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision', 'expired')),
  file_url text,
  file_size integer CHECK (file_size > 0),
  mime_type text,
  uploaded_by uuid REFERENCES profiles(id),
  reviewed_by uuid REFERENCES profiles(id),
  uploaded_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  expires_at timestamptz,
  notes text,
  metadata jsonb DEFAULT '{}'
);

-- 8. Document Templates
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  content_template text NOT NULL,
  type text NOT NULL,
  category text,
  variables jsonb DEFAULT '[]',
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. Communication Logs
CREATE TABLE IF NOT EXISTS communication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'note', 'chat')),
  subject text,
  content text NOT NULL,
  direction text DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 10. Client Satisfaction Surveys
CREATE TABLE IF NOT EXISTS client_satisfaction_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating integer CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  feedback text,
  would_recommend boolean,
  survey_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 11. Onboarding System
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  step_order integer NOT NULL,
  checklist_items jsonb DEFAULT '[]',
  is_required boolean DEFAULT true,
  estimated_duration_hours integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  step_id uuid REFERENCES onboarding_steps(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, step_id)
);

-- 12. Content Management
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  author_id uuid REFERENCES profiles(id),
  category text,
  tags text[] DEFAULT ARRAY[]::text[],
  language_code text DEFAULT 'en',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  featured_image_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  language_code text DEFAULT 'en',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS static_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value text NOT NULL,
  language_code text DEFAULT 'en',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(key, language_code)
);

-- 13. System Settings
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  category text DEFAULT 'general',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 14. Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text NOT NULL,
  api_key_encrypted text,
  secret_key_encrypted text,
  config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  related_table text,
  related_id uuid,
  action_url text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_table text,
  target_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

-- 17. Knowledge Base
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text,
  tags text[] DEFAULT ARRAY[]::text[],
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  author_id uuid REFERENCES profiles(id),
  is_published boolean DEFAULT false,
  published_at timestamptz,
  language_code text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 18. Content Review Requests
CREATE TABLE IF NOT EXISTS content_review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  page_url text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 19. Time Entries
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  description text,
  date date NOT NULL,
  billable boolean DEFAULT true,
  hourly_rate numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default roles
INSERT INTO roles (name, description, is_system_role) VALUES
  ('admin', 'Platform Administrator', true),
  ('consultant', 'Business Consultant', true),
  ('client', 'Client User', true),
  ('legal_reviewer', 'Legal Document Reviewer', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('manage_users', 'Manage all users', 'users', 'manage'),
  ('view_users', 'View user information', 'users', 'view'),
  ('manage_countries', 'Manage countries', 'countries', 'manage'),
  ('view_countries', 'View countries', 'countries', 'view'),
  ('manage_content', 'Manage content', 'content', 'manage'),
  ('view_content', 'View content', 'content', 'view'),
  ('manage_settings', 'Manage system settings', 'settings', 'manage'),
  ('view_reports', 'View financial reports', 'reports', 'view'),
  ('manage_clients', 'Manage assigned clients', 'clients', 'manage'),
  ('view_clients', 'View assigned clients', 'clients', 'view'),
  ('manage_projects', 'Manage projects', 'projects', 'manage'),
  ('view_projects', 'View projects', 'projects', 'view'),
  ('manage_tasks', 'Manage tasks', 'tasks', 'manage'),
  ('view_tasks', 'View tasks', 'tasks', 'view'),
  ('upload_documents', 'Upload documents', 'documents', 'upload'),
  ('view_documents', 'View documents', 'documents', 'view')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
DO $$
DECLARE
  admin_role_id uuid;
  consultant_role_id uuid;
  client_role_id uuid;
  legal_role_id uuid;
BEGIN
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  SELECT id INTO consultant_role_id FROM roles WHERE name = 'consultant';
  SELECT id INTO client_role_id FROM roles WHERE name = 'client';
  SELECT id INTO legal_role_id FROM roles WHERE name = 'legal_reviewer';

  -- Admin permissions (all)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT admin_role_id, id FROM permissions
  ON CONFLICT DO NOTHING;

  -- Consultant permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT consultant_role_id, id FROM permissions 
  WHERE name IN ('view_countries', 'manage_clients', 'view_clients', 'manage_projects', 'view_projects', 'manage_tasks', 'view_tasks', 'upload_documents', 'view_documents')
  ON CONFLICT DO NOTHING;

  -- Client permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT client_role_id, id FROM permissions 
  WHERE name IN ('view_countries', 'view_projects', 'view_tasks', 'upload_documents', 'view_documents')
  ON CONFLICT DO NOTHING;

  -- Legal reviewer permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT legal_role_id, id FROM permissions 
  WHERE name IN ('view_documents', 'view_projects')
  ON CONFLICT DO NOTHING;
END $$;

-- Insert default countries
INSERT INTO countries (name, slug, flag_emoji, description, image_url, primary_language, supported_languages, highlights, tags) VALUES
  ('Georgia', 'georgia', '🇬🇪', 'Strategic gateway between Europe and Asia with exceptional business opportunities', 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=800', 'en', ARRAY['en', 'ka'], ARRAY['Easy company formation process', '0% tax on foreign-sourced income', 'Free economic zones available'], ARRAY['Tax Friendly', 'EU Proximity', 'Gateway Location']),
  ('United States', 'usa', '🇺🇸', 'World''s largest economy with unmatched market access and innovation ecosystem', 'https://images.pexels.com/photos/1237119/pexels-photo-1237119.jpeg?auto=compress&cs=tinysrgb&w=800', 'en', ARRAY['en'], ARRAY['Delaware LLC advantages', 'Global market access', 'Advanced banking systems'], ARRAY['Market Access', 'Innovation Hub', 'Global Standard']),
  ('Estonia', 'estonia', '🇪🇪', 'Digital innovation leader with e-Residency program and tech-forward governance', 'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800', 'en', ARRAY['en', 'et'], ARRAY['e-Residency program', 'Digital nomad friendly', 'Advanced tech infrastructure'], ARRAY['Digital Leader', 'e-Residency', 'Tech Hub']),
  ('UAE', 'uae', '🇦🇪', 'Middle East business hub with free zones and strategic location', 'https://images.pexels.com/photos/1456291/pexels-photo-1456291.jpeg?auto=compress&cs=tinysrgb&w=800', 'en', ARRAY['en', 'ar'], ARRAY['Tax-free zones available', 'Strategic Middle East location', 'Modern business infrastructure'], ARRAY['Tax Free', 'Middle East Hub', 'Modern Infrastructure'])
ON CONFLICT (slug) DO NOTHING;

-- Insert default onboarding steps
INSERT INTO onboarding_steps (name, description, step_order, checklist_items, estimated_duration_hours) VALUES
  ('Initial Consultation', 'Welcome call and requirement gathering', 1, '["Schedule welcome call", "Gather business requirements", "Explain process", "Set expectations"]', 2),
  ('Document Collection', 'Collect required documents from client', 2, '["Passport/ID copies", "Proof of address", "Business plan", "Financial statements"]', 4),
  ('Company Structure Planning', 'Plan optimal company structure', 3, '["Analyze business model", "Recommend structure", "Tax optimization review", "Compliance check"]', 6),
  ('Registration Process', 'Complete company registration', 4, '["Submit registration", "Obtain certificates", "Tax registration", "Bank account setup"]', 8),
  ('Post-Registration Setup', 'Complete setup and handover', 5, '["Deliver documents", "Setup accounting", "Provide ongoing support info", "Client satisfaction survey"]', 4)
ON CONFLICT DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, description, category) VALUES
  ('commission_rates', '{"consultant": 0.65, "platform": 0.35}', 'Commission split between consultant and platform', 'financial'),
  ('default_currency', '"USD"', 'Default currency for the platform', 'general'),
  ('notification_settings', '{"email_enabled": true, "sms_enabled": false, "push_enabled": true}', 'Notification preferences', 'notifications'),
  ('onboarding_enabled', 'true', 'Enable client onboarding workflow', 'features'),
  ('max_file_size_mb', '50', 'Maximum file upload size in MB', 'uploads')
ON CONFLICT (key) DO NOTHING;

-- Create production users
DO $$
DECLARE
  admin_role_id uuid;
  consultant_role_id uuid;
  client_role_id uuid;
BEGIN
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  SELECT id INTO consultant_role_id FROM roles WHERE name = 'consultant';
  SELECT id INTO client_role_id FROM roles WHERE name = 'client';

  -- Insert production users (these will be created in auth.users via the application)
  INSERT INTO profiles (id, auth_user_id, email, role_id, legacy_role, full_name, country, is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'admin@consulting19.com', admin_role_id, 'admin', 'System Administrator', 'Global', true),
    ('3732cae6-3238-44b6-9c6b-2f29f0216a83', '3732cae6-3238-44b6-9c6b-2f29f0216a83', 'georgia@consulting19.com', consultant_role_id, 'consultant', 'Nino Kvaratskhelia', 'Georgia', true),
    ('7f9c8d5e-4b3a-4c2d-8e1f-9a8b7c6d5e4f', '7f9c8d5e-4b3a-4c2d-8e1f-9a8b7c6d5e4f', 'client.georgia@consulting19.com', client_role_id, 'client', 'Tech Startup LLC', 'Georgia', true),
    ('9e8d7c6b-5a4f-3e2d-1c0b-8a9f8e7d6c5b', '9e8d7c6b-5a4f-3e2d-1c0b-8a9f8e7d6c5b', 'support@consulting19.com', admin_role_id, 'admin', 'Customer Support', 'Global', true)
  ON CONFLICT (email) DO NOTHING;

  -- Assign Georgia consultant to Georgia
  INSERT INTO consultant_country_assignments (consultant_id, country_id, is_primary, status)
  SELECT '3732cae6-3238-44b6-9c6b-2f29f0216a83', id, true, 'active'
  FROM countries WHERE slug = 'georgia'
  ON CONFLICT DO NOTHING;

  -- Create sample client assignment
  INSERT INTO clients (id, profile_id, assigned_consultant_id, company_name, status, priority, service_type, progress)
  VALUES ('8a7b6c5d-4e3f-2a1b-9c8d-7e6f5a4b3c2d', '7f9c8d5e-4b3a-4c2d-8e1f-9a8b7c6d5e4f', '3732cae6-3238-44b6-9c6b-2f29f0216a83', 'Tech Startup LLC', 'in_progress', 'high', 'company_formation', 75)
  ON CONFLICT (profile_id) DO NOTHING;

  -- Create sample project
  INSERT INTO projects (client_id, consultant_id, name, description, status, priority, progress, estimated_hours, actual_hours)
  VALUES ('8a7b6c5d-4e3f-2a1b-9c8d-7e6f5a4b3c2d', '3732cae6-3238-44b6-9c6b-2f29f0216a83', 'Georgia LLC Formation', 'Complete company formation in Georgia including bank account setup', 'active', 'high', 75, 40, 30)
  ON CONFLICT DO NOTHING;

  -- Create sample tasks
  INSERT INTO tasks (project_id, client_id, consultant_id, title, description, status, priority, due_date, estimated_hours)
  SELECT p.id, p.client_id, p.consultant_id, 'Document Review', 'Review and approve client documents', 'in_progress', 'high', now() + interval '3 days', 4
  FROM projects p WHERE p.name = 'Georgia LLC Formation'
  ON CONFLICT DO NOTHING;
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_satisfaction_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = auth_user_id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- RLS Policies for countries
CREATE POLICY "Anyone can view active countries" ON countries FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage countries" ON countries FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- RLS Policies for clients
CREATE POLICY "Clients can view own record" ON clients FOR SELECT TO authenticated USING (
  profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Consultants can view assigned clients" ON clients FOR SELECT TO authenticated USING (
  assigned_consultant_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Consultants can update assigned clients" ON clients FOR UPDATE TO authenticated USING (
  assigned_consultant_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Admins can manage all clients" ON clients FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- RLS Policies for projects
CREATE POLICY "Clients can view own projects" ON projects FOR SELECT TO authenticated USING (
  client_id IN (SELECT id FROM clients WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
);
CREATE POLICY "Consultants can manage assigned projects" ON projects FOR ALL TO authenticated USING (
  consultant_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Admins can manage all projects" ON projects FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- RLS Policies for tasks
CREATE POLICY "Users can view related tasks" ON tasks FOR SELECT TO authenticated USING (
  consultant_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR
  client_id IN (SELECT id FROM clients WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())) OR
  assigned_to IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Consultants can manage tasks" ON tasks FOR ALL TO authenticated USING (
  consultant_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Admins can manage all tasks" ON tasks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- RLS Policies for documents
CREATE POLICY "Users can view related documents" ON documents FOR SELECT TO authenticated USING (
  client_id IN (SELECT id FROM clients WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())) OR
  uploaded_by IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR
  reviewed_by IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Users can upload documents" ON documents FOR INSERT TO authenticated WITH CHECK (
  uploaded_by IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Consultants can manage client documents" ON documents FOR ALL TO authenticated USING (
  client_id IN (SELECT id FROM clients WHERE assigned_consultant_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
);
CREATE POLICY "Admins can manage all documents" ON documents FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (
  user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (
  user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- RLS Policies for settings
CREATE POLICY "Admins can manage settings" ON settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);
CREATE POLICY "Users can view public settings" ON settings FOR SELECT TO authenticated USING (is_public = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_legacy_role ON profiles(legacy_role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_consultant_id ON clients(assigned_consultant_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_consultant_id ON projects(consultant_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_consultant_id ON tasks(consultant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_onboarding_steps_updated_at BEFORE UPDATE ON onboarding_steps FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_client_onboarding_progress_updated_at BEFORE UPDATE ON client_onboarding_progress FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_content_review_requests_updated_at BEFORE UPDATE ON content_review_requests FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_knowledge_base_articles_updated_at BEFORE UPDATE ON knowledge_base_articles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Create auto-profile creation trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  client_role_id uuid;
BEGIN
  -- Get client role ID
  SELECT id INTO client_role_id FROM roles WHERE name = 'client';
  
  -- Create profile for new user
  INSERT INTO profiles (auth_user_id, email, role_id, legacy_role, full_name, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    client_role_id,
    'client',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to ensure profile exists
CREATE OR REPLACE FUNCTION ensure_profile()
RETURNS TABLE(profile_data jsonb) AS $$
DECLARE
  current_user_id uuid;
  user_profile profiles%ROWTYPE;
  client_role_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT '{"error": "No authenticated user"}'::jsonb;
    RETURN;
  END IF;

  -- Try to get existing profile
  SELECT * INTO user_profile FROM profiles WHERE auth_user_id = current_user_id;
  
  IF user_profile.id IS NULL THEN
    -- Get client role ID
    SELECT id INTO client_role_id FROM roles WHERE name = 'client';
    
    -- Create profile if it doesn't exist
    INSERT INTO profiles (auth_user_id, email, role_id, legacy_role, full_name, is_active)
    SELECT 
      current_user_id,
      au.email,
      client_role_id,
      'client',
      COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
      true
    FROM auth.users au WHERE au.id = current_user_id
    RETURNING * INTO user_profile;
  END IF;
  
  RETURN QUERY SELECT row_to_json(user_profile)::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;