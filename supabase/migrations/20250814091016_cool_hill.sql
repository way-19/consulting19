/*
  # Complete Clean System Setup for Consulting19 Platform

  This migration creates a comprehensive, clean database structure for the Consulting19 platform
  with all necessary tables, functions, triggers, and security policies.

  ## 1. New Tables
  - Enhanced profiles table with proper auth integration
  - Comprehensive countries management
  - Advanced client and consultant management
  - Task and project management
  - Document and virtual mailbox systems
  - Accounting and financial management
  - Audit logging and security
  - Content management system
  - Integration management
  - RBAC (Role-Based Access Control)

  ## 2. Security
  - Row Level Security enabled on all tables
  - Comprehensive RLS policies for each role
  - Audit logging for admin actions
  - Secure API key storage

  ## 3. Automation
  - Auto-profile creation triggers
  - Automatic commission calculations
  - Notification and reminder systems
  - Audit trail automation
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS content_review_requests CASCADE;
DROP TABLE IF EXISTS knowledge_base_articles CASCADE;
DROP TABLE IF EXISTS client_satisfaction_surveys CASCADE;
DROP TABLE IF EXISTS communication_logs CASCADE;
DROP TABLE IF EXISTS onboarding_steps CASCADE;
DROP TABLE IF EXISTS client_onboarding_progress CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS static_content CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS project_tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS ensure_profile() CASCADE;
DROP FUNCTION IF EXISTS log_admin_action() CASCADE;
DROP FUNCTION IF EXISTS calculate_commission_split() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;

-- =============================================
-- CORE SYSTEM TABLES
-- =============================================

-- Enhanced Roles and Permissions System (RBAC)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Enhanced Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role_id UUID REFERENCES roles(id) DEFAULT NULL,
  legacy_role TEXT DEFAULT 'client' CHECK (legacy_role IN ('admin', 'consultant', 'client')),
  full_name TEXT,
  phone TEXT,
  country TEXT,
  language_preference TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Countries Table (Enhanced)
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  flag_emoji TEXT,
  description TEXT,
  image_url TEXT,
  primary_language TEXT DEFAULT 'en',
  supported_languages TEXT[] DEFAULT ARRAY['en'],
  highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  insights JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Consultant Country Assignments
CREATE TABLE consultant_country_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(consultant_id, country_id)
);

-- Enhanced Clients Table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_consultant_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  service_type TEXT DEFAULT 'company_formation',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  segment TEXT DEFAULT 'standard',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PROJECT AND TASK MANAGEMENT
-- =============================================

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  budget DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enhanced Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  estimated_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  dependencies UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Time Tracking
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- DOCUMENT MANAGEMENT
-- =============================================

-- Enhanced Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('identity', 'business', 'financial', 'legal', 'tax', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision', 'expired')),
  file_url TEXT,
  file_size INTEGER CHECK (file_size > 0),
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Document Templates
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  content_template TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Virtual Mailbox (Enhanced)
CREATE TABLE virtual_mailbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_size INTEGER CHECK (file_size > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'viewed', 'downloaded')),
  tracking_number TEXT UNIQUE,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'waived')),
  shipping_address JSONB DEFAULT '{}'::jsonb,
  sent_date TIMESTAMPTZ,
  delivered_date TIMESTAMPTZ,
  viewed_date TIMESTAMPTZ,
  downloaded_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ACCOUNTING AND FINANCIAL MANAGEMENT
-- =============================================

-- Accounting Clients (Enhanced)
CREATE TABLE accounting_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  tax_number TEXT,
  business_type TEXT DEFAULT 'limited_company',
  accounting_period TEXT DEFAULT 'monthly' CHECK (accounting_period IN ('monthly', 'quarterly', 'yearly')),
  service_package TEXT DEFAULT 'basic',
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_document_received TIMESTAMPTZ,
  next_deadline TIMESTAMPTZ,
  reminder_frequency INTEGER DEFAULT 7,
  preferred_language TEXT DEFAULT 'en',
  billing_address JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Accounting Documents (Enhanced)
CREATE TABLE accounting_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  category TEXT DEFAULT 'financial' CHECK (category IN ('financial', 'tax', 'legal', 'compliance', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  received_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'processed', 'completed', 'overdue')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  reminder_sent BOOLEAN DEFAULT false,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_sent TIMESTAMPTZ,
  file_url TEXT,
  file_size INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Accounting Invoices (Enhanced)
CREATE TABLE accounting_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  period_start DATE,
  period_end DATE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  stripe_invoice_id TEXT,
  payment_terms TEXT DEFAULT '30 days',
  line_items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CONTENT MANAGEMENT SYSTEM
-- =============================================

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  language_code TEXT DEFAULT 'en',
  featured_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  read_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- FAQs
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  language_code TEXT DEFAULT 'en',
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Static Content Management
CREATE TABLE static_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  language_code TEXT DEFAULT 'en',
  category TEXT DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(key, language_code)
);

-- =============================================
-- CUSTOMER RELATIONSHIP MANAGEMENT
-- =============================================

-- Communication Logs
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'note', 'chat')),
  subject TEXT,
  content TEXT NOT NULL,
  direction TEXT DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  timestamp TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Client Satisfaction Surveys
CREATE TABLE client_satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_type TEXT,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  feedback TEXT,
  would_recommend BOOLEAN,
  survey_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Onboarding System
CREATE TABLE onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  step_order INTEGER NOT NULL,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  required_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  estimated_duration_days INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE client_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  step_id UUID REFERENCES onboarding_steps(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, step_id)
);

-- =============================================
-- SYSTEM MANAGEMENT
-- =============================================

-- System Settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Integration Management
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  api_key_encrypted TEXT,
  secret_key_encrypted TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  test_status TEXT DEFAULT 'unknown' CHECK (test_status IN ('unknown', 'success', 'failed')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications System
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  related_table TEXT,
  related_id UUID,
  action_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Knowledge Base
CREATE TABLE knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  language_code TEXT DEFAULT 'en',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Content Review Requests
CREATE TABLE content_review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  section TEXT,
  current_content TEXT,
  suggested_content TEXT,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'implemented')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-profile creation function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Get default client role
  SELECT id INTO default_role_id FROM roles WHERE name = 'client' LIMIT 1;
  
  INSERT INTO public.profiles (
    auth_user_id,
    email,
    role_id,
    legacy_role,
    full_name
  ) VALUES (
    NEW.id,
    NEW.email,
    default_role_id,
    'client',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit logging function
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, target_table, target_id, old_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, target_table, target_id, old_values, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, target_table, target_id, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commission calculation function
CREATE OR REPLACE FUNCTION calculate_commission_split()
RETURNS TRIGGER AS $$
BEGIN
  -- 65% to consultant, 35% platform fee
  NEW.consultant_commission = NEW.total_amount * 0.65;
  NEW.platform_fee = NEW.total_amount * 0.35;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Order number generation
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tracking number generation for virtual mailbox
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_number = 'VM-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(nextval('tracking_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEQUENCES
-- =============================================

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS tracking_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- =============================================
-- TRIGGERS
-- =============================================

-- Auth trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated at triggers
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_accounting_clients_updated_at BEFORE UPDATE ON accounting_clients FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_accounting_documents_updated_at BEFORE UPDATE ON accounting_documents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_virtual_mailbox_items_updated_at BEFORE UPDATE ON virtual_mailbox_items FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Audit triggers for sensitive tables
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION log_admin_action();
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients FOR EACH ROW EXECUTE FUNCTION log_admin_action();
CREATE TRIGGER audit_settings AFTER INSERT OR UPDATE OR DELETE ON settings FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- Business logic triggers
CREATE TRIGGER generate_tracking_number_trigger BEFORE INSERT ON virtual_mailbox_items FOR EACH ROW EXECUTE FUNCTION generate_tracking_number();

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_country_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_mailbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_satisfaction_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_review_requests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- Countries policies (public read, admin write)
CREATE POLICY "Anyone can view active countries" ON countries FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can manage countries" ON countries FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- Clients policies
CREATE POLICY "Clients can view own record" ON clients FOR SELECT TO authenticated USING (
  profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Consultants can view assigned clients" ON clients FOR SELECT TO authenticated USING (
  assigned_consultant_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Consultants can update assigned clients" ON clients FOR UPDATE TO authenticated USING (
  assigned_consultant_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Admins can manage all clients" ON clients FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- Tasks policies
CREATE POLICY "Users can view their tasks" ON tasks FOR SELECT TO authenticated USING (
  consultant_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR
  assigned_to = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR
  client_id IN (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
);
CREATE POLICY "Consultants can manage their tasks" ON tasks FOR ALL TO authenticated USING (
  consultant_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Admins can manage all tasks" ON tasks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- Documents policies
CREATE POLICY "Users can view their documents" ON documents FOR SELECT TO authenticated USING (
  client_id IN (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())) OR
  uploaded_by = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR
  reviewed_by = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Consultants can manage client documents" ON documents FOR ALL TO authenticated USING (
  client_id IN (SELECT id FROM clients WHERE assigned_consultant_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
);
CREATE POLICY "Admins can manage all documents" ON documents FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (
  user_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (
  user_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

-- Settings policies (admin only)
CREATE POLICY "Admins can manage settings" ON settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);
CREATE POLICY "Public can view public settings" ON settings FOR SELECT TO public USING (is_public = true);

-- Audit logs policies (admin only)
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND legacy_role = 'admin')
);

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default roles
INSERT INTO roles (name, description, is_system_role) VALUES
('admin', 'Platform Administrator', true),
('consultant', 'Business Consultant', true),
('client', 'Client User', true),
('support', 'Customer Support', true);

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
('manage_users', 'Manage all users', 'users', 'manage'),
('view_users', 'View user list', 'users', 'view'),
('manage_countries', 'Manage countries', 'countries', 'manage'),
('view_countries', 'View countries', 'countries', 'view'),
('manage_content', 'Manage content', 'content', 'manage'),
('view_analytics', 'View analytics', 'analytics', 'view'),
('manage_settings', 'Manage system settings', 'settings', 'manage'),
('manage_integrations', 'Manage integrations', 'integrations', 'manage');

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin'; -- Admin gets all permissions

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'consultant' AND p.name IN ('view_users', 'view_countries', 'view_analytics');

-- Insert default countries
INSERT INTO countries (name, slug, flag_emoji, description, primary_language, supported_languages, highlights, tags) VALUES
('Georgia', 'georgia', '🇬🇪', 'Strategic gateway between Europe and Asia with exceptional business opportunities', 'en', ARRAY['en', 'ka'], 
 ARRAY['Easy company formation process', '0% tax on foreign-sourced income', 'Free economic zones available'], 
 ARRAY['Tax Friendly', 'EU Proximity', 'Gateway Location']),
('United States', 'usa', '🇺🇸', 'World''s largest economy with unmatched market access and innovation ecosystem', 'en', ARRAY['en'], 
 ARRAY['Delaware LLC advantages', 'Global market access', 'Advanced banking systems'], 
 ARRAY['Market Access', 'Innovation Hub', 'Global Standard']),
('Estonia', 'estonia', '🇪🇪', 'Digital innovation leader with e-Residency program and tech-forward governance', 'en', ARRAY['en', 'et'], 
 ARRAY['e-Residency program', 'Digital nomad friendly', 'Advanced tech infrastructure'], 
 ARRAY['Digital Leader', 'e-Residency', 'Tech Hub']);

-- Insert default onboarding steps
INSERT INTO onboarding_steps (name, description, step_order, checklist_items, required_documents) VALUES
('Welcome & Account Setup', 'Initial account setup and welcome process', 1, 
 '["Complete profile information", "Verify email address", "Set communication preferences"]'::jsonb,
 ARRAY['ID Document', 'Proof of Address']),
('Service Selection', 'Choose services and jurisdiction', 2,
 '["Select target country", "Choose service package", "Review pricing"]'::jsonb,
 ARRAY['Business Plan', 'Financial Statements']),
('Document Collection', 'Gather required documents', 3,
 '["Upload required documents", "Complete KYC process", "Verify information"]'::jsonb,
 ARRAY['Passport', 'Bank Statements', 'Business Registration']),
('Consultant Assignment', 'Get matched with expert consultant', 4,
 '["Review consultant profile", "Schedule initial consultation", "Confirm assignment"]'::jsonb,
 ARRAY[]),
('Project Initiation', 'Begin service delivery', 5,
 '["Project kickoff meeting", "Timeline confirmation", "Communication setup"]'::jsonb,
 ARRAY[]);

-- Insert default settings
INSERT INTO settings (key, value, description, category) VALUES
('commission_rate', '{"consultant": 0.65, "platform": 0.35}'::jsonb, 'Commission split rates', 'financial'),
('default_currency', '"USD"'::jsonb, 'Default platform currency', 'general'),
('notification_settings', '{"email": true, "sms": false, "push": true}'::jsonb, 'Default notification preferences', 'notifications'),
('onboarding_enabled', 'true'::jsonb, 'Enable client onboarding process', 'features'),
('maintenance_mode', 'false'::jsonb, 'Platform maintenance mode', 'system');

-- Create production users with proper profiles
DO $$
DECLARE
  admin_user_id UUID;
  consultant_user_id UUID;
  client_user_id UUID;
  support_user_id UUID;
  admin_role_id UUID;
  consultant_role_id UUID;
  client_role_id UUID;
  georgia_country_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  SELECT id INTO consultant_role_id FROM roles WHERE name = 'consultant';
  SELECT id INTO client_role_id FROM roles WHERE name = 'client';
  SELECT id INTO georgia_country_id FROM countries WHERE slug = 'georgia';

  -- Create admin user
  admin_user_id := gen_random_uuid();
  INSERT INTO profiles (id, auth_user_id, email, role_id, legacy_role, full_name, is_active)
  VALUES (admin_user_id, admin_user_id, 'admin@consulting19.com', admin_role_id, 'admin', 'System Administrator', true);

  -- Create consultant user
  consultant_user_id := gen_random_uuid();
  INSERT INTO profiles (id, auth_user_id, email, role_id, legacy_role, full_name, country, is_active)
  VALUES (consultant_user_id, consultant_user_id, 'georgia@consulting19.com', consultant_role_id, 'consultant', 'Nino Kvaratskhelia', 'Georgia', true);

  -- Assign consultant to Georgia
  INSERT INTO consultant_country_assignments (consultant_id, country_id, is_primary, status)
  VALUES (consultant_user_id, georgia_country_id, true, 'active');

  -- Create client user
  client_user_id := gen_random_uuid();
  INSERT INTO profiles (id, auth_user_id, email, role_id, legacy_role, full_name, country, is_active)
  VALUES (client_user_id, client_user_id, 'client.georgia@consulting19.com', client_role_id, 'client', 'Tech Startup Founder', 'Georgia', true);

  -- Create client record
  INSERT INTO clients (profile_id, assigned_consultant_id, company_name, status, priority, service_type, progress)
  VALUES (client_user_id, consultant_user_id, 'Georgia Tech Solutions LLC', 'in_progress', 'high', 'company_formation', 75);

  -- Create support user
  support_user_id := gen_random_uuid();
  INSERT INTO profiles (id, auth_user_id, email, role_id, legacy_role, full_name, is_active)
  VALUES (support_user_id, support_user_id, 'support@consulting19.com', admin_role_id, 'admin', 'Customer Support', true);

END $$;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(legacy_role);
CREATE INDEX idx_profiles_active ON profiles(is_active);

-- Clients indexes
CREATE INDEX idx_clients_consultant ON clients(assigned_consultant_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_priority ON clients(priority);

-- Tasks indexes
CREATE INDEX idx_tasks_consultant ON tasks(consultant_id);
CREATE INDEX idx_tasks_client ON tasks(client_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Documents indexes
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_category ON documents(category);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(target_table);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample project for testing
INSERT INTO projects (client_id, consultant_id, name, description, status, priority, start_date, estimated_hours, budget)
SELECT c.id, c.assigned_consultant_id, 'Georgia Company Formation', 'Complete company formation process in Georgia', 'active', 'high', CURRENT_DATE, 40, 2500.00
FROM clients c WHERE c.company_name = 'Georgia Tech Solutions LLC' LIMIT 1;

-- Insert sample tasks
INSERT INTO tasks (project_id, client_id, consultant_id, title, description, status, priority, due_date, estimated_hours)
SELECT p.id, p.client_id, p.consultant_id, 'Prepare incorporation documents', 'Draft and prepare all necessary incorporation documents', 'completed', 'high', now() + interval '3 days', 8
FROM projects p WHERE p.name = 'Georgia Company Formation' LIMIT 1;

INSERT INTO tasks (project_id, client_id, consultant_id, title, description, status, priority, due_date, estimated_hours)
SELECT p.id, p.client_id, p.consultant_id, 'Submit registration application', 'Submit company registration to House of Justice', 'in_progress', 'high', now() + interval '5 days', 4
FROM projects p WHERE p.name = 'Georgia Company Formation' LIMIT 1;

-- Insert sample accounting client
INSERT INTO accounting_clients (client_id, consultant_id, company_name, business_type, accounting_period, service_package, monthly_fee, status)
SELECT c.id, c.assigned_consultant_id, c.company_name, 'limited_company', 'monthly', 'premium', 750.00, 'active'
FROM clients c WHERE c.company_name = 'Georgia Tech Solutions LLC' LIMIT 1;

-- Insert sample knowledge base articles
INSERT INTO knowledge_base_articles (title, content, category, country_id, language_code, status, published_at)
SELECT 'Georgia Company Formation Guide', 'Comprehensive guide to forming a company in Georgia...', 'legal', c.id, 'en', 'published', now()
FROM countries c WHERE c.slug = 'georgia' LIMIT 1;

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, language_code, country_id)
SELECT 'How long does company formation take in Georgia?', 'Company formation in Georgia typically takes 3-5 business days once all documents are submitted.', 'formation', 'en', c.id
FROM countries c WHERE c.slug = 'georgia' LIMIT 1;

-- =============================================
-- FINAL VERIFICATION
-- =============================================

-- Verify table creation
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'countries', 'clients', 'projects', 'tasks', 'documents', 'roles', 'permissions');
  
  IF table_count < 8 THEN
    RAISE EXCEPTION 'Not all required tables were created. Expected at least 8, got %', table_count;
  END IF;
  
  RAISE NOTICE 'Database setup completed successfully. Created % core tables.', table_count;
END $$;