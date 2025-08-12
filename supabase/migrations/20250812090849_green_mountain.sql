/*
  # Create Accounting Management Tables

  1. New Tables
    - `accounting_clients` - Client accounting profiles and settings
    - `accounting_documents` - Document tracking and deadlines
    - `accounting_tasks` - Task management for accounting work
    - `accounting_reminders` - Automated reminder system
    - `accounting_messages` - Multilingual messaging system
    - `accounting_periods` - Accounting period management
    - `accounting_services` - Service packages and pricing
    - `accounting_invoices` - Invoice generation and tracking
    - `accounting_payments` - Payment tracking and history
    - `accounting_reports` - Generated reports and analytics

  2. Security
    - Enable RLS on all tables
    - Add policies for consultants and clients
    - Proper role-based access control

  3. Features
    - Automatic reminder generation
    - Commission calculation (65% consultant, 35% platform)
    - Multilingual support
    - Document status tracking
    - Payment integration
*/

-- Create accounting_clients table
CREATE TABLE IF NOT EXISTS accounting_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  tax_number text,
  business_type text NOT NULL DEFAULT 'limited_company',
  accounting_period text NOT NULL DEFAULT 'monthly',
  service_package text NOT NULL DEFAULT 'basic',
  monthly_fee numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_document_received timestamptz,
  next_deadline timestamptz,
  reminder_frequency integer NOT NULL DEFAULT 7,
  preferred_language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create accounting_documents table
CREATE TABLE IF NOT EXISTS accounting_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  category text NOT NULL DEFAULT 'financial' CHECK (category IN ('financial', 'tax', 'legal', 'compliance', 'other')),
  title text NOT NULL,
  description text,
  due_date timestamptz,
  received_date timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'processed', 'completed', 'overdue')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  reminder_sent boolean DEFAULT false,
  reminder_count integer DEFAULT 0,
  last_reminder_sent timestamptz,
  file_url text,
  file_size integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create accounting_tasks table
CREATE TABLE IF NOT EXISTS accounting_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  task_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  estimated_hours integer CHECK (estimated_hours > 0),
  actual_hours integer CHECK (actual_hours >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create accounting_reminders table
CREATE TABLE IF NOT EXISTS accounting_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_id uuid REFERENCES accounting_documents(id) ON DELETE CASCADE,
  reminder_type text NOT NULL DEFAULT 'document_due',
  title text NOT NULL,
  message text NOT NULL,
  due_date timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'cancelled')),
  reminder_level integer NOT NULL DEFAULT 1,
  language text DEFAULT 'en',
  sent_at timestamptz,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create accounting_messages table
CREATE TABLE IF NOT EXISTS accounting_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text,
  message text NOT NULL,
  original_language text DEFAULT 'en',
  translated_message text,
  target_language text,
  category text DEFAULT 'general' CHECK (category IN ('general', 'reminder', 'urgent', 'document_request')),
  is_read boolean DEFAULT false,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create accounting_periods table
CREATE TABLE IF NOT EXISTS accounting_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES accounting_clients(id) ON DELETE CASCADE,
  period_type text NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
  documents_required jsonb DEFAULT '[]',
  documents_received jsonb DEFAULT '[]',
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create accounting_services table
CREATE TABLE IF NOT EXISTS accounting_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  service_type text NOT NULL DEFAULT 'bookkeeping',
  price_monthly numeric(10,2),
  price_quarterly numeric(10,2),
  price_yearly numeric(10,2),
  features jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create accounting_invoices table
CREATE TABLE IF NOT EXISTS accounting_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_number text UNIQUE NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  due_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  stripe_invoice_id text,
  payment_terms text DEFAULT '30 days',
  line_items jsonb DEFAULT '[]',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create accounting_payments table
CREATE TABLE IF NOT EXISTS accounting_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES accounting_invoices(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_method text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  consultant_commission numeric(10,2) NOT NULL DEFAULT 0,
  platform_fee numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create accounting_reports table
CREATE TABLE IF NOT EXISTS accounting_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_type text NOT NULL DEFAULT 'monthly_summary',
  period_start date NOT NULL,
  period_end date NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'reviewed')),
  file_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounting_clients_consultant_id ON accounting_clients(consultant_id);
CREATE INDEX IF NOT EXISTS idx_accounting_clients_status ON accounting_clients(status);
CREATE INDEX IF NOT EXISTS idx_accounting_documents_client_id ON accounting_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_accounting_documents_consultant_id ON accounting_documents(consultant_id);
CREATE INDEX IF NOT EXISTS idx_accounting_documents_status ON accounting_documents(status);
CREATE INDEX IF NOT EXISTS idx_accounting_documents_due_date ON accounting_documents(due_date);
CREATE INDEX IF NOT EXISTS idx_accounting_tasks_client_id ON accounting_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_accounting_tasks_consultant_id ON accounting_tasks(consultant_id);
CREATE INDEX IF NOT EXISTS idx_accounting_tasks_status ON accounting_tasks(status);
CREATE INDEX IF NOT EXISTS idx_accounting_tasks_due_date ON accounting_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_accounting_reminders_client_id ON accounting_reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_accounting_reminders_consultant_id ON accounting_reminders(consultant_id);
CREATE INDEX IF NOT EXISTS idx_accounting_reminders_status ON accounting_reminders(status);
CREATE INDEX IF NOT EXISTS idx_accounting_messages_client_id ON accounting_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_accounting_messages_consultant_id ON accounting_messages(consultant_id);
CREATE INDEX IF NOT EXISTS idx_accounting_invoices_client_id ON accounting_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_accounting_invoices_status ON accounting_invoices(status);
CREATE INDEX IF NOT EXISTS idx_accounting_payments_invoice_id ON accounting_payments(invoice_id);

-- Enable Row Level Security
ALTER TABLE accounting_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounting_clients
CREATE POLICY "Consultants can manage their accounting clients"
  ON accounting_clients
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Clients can view their accounting profile"
  ON accounting_clients
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid()));

CREATE POLICY "Admins can manage all accounting clients"
  ON accounting_clients
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for accounting_documents
CREATE POLICY "Consultants can manage their client documents"
  ON accounting_documents
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Clients can view their documents"
  ON accounting_documents
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM accounting_clients WHERE client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())));

CREATE POLICY "Admins can manage all documents"
  ON accounting_documents
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for accounting_tasks
CREATE POLICY "Consultants can manage their tasks"
  ON accounting_tasks
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Clients can view their tasks"
  ON accounting_tasks
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM accounting_clients WHERE client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())));

CREATE POLICY "Admins can manage all tasks"
  ON accounting_tasks
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for accounting_reminders
CREATE POLICY "Consultants can manage their reminders"
  ON accounting_reminders
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Clients can view their reminders"
  ON accounting_reminders
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM accounting_clients WHERE client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())));

CREATE POLICY "Admins can manage all reminders"
  ON accounting_reminders
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for accounting_messages
CREATE POLICY "Users can manage their messages"
  ON accounting_messages
  FOR ALL
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Admins can manage all messages"
  ON accounting_messages
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for accounting_periods
CREATE POLICY "Consultants can manage their client periods"
  ON accounting_periods
  FOR ALL
  TO authenticated
  USING (client_id IN (SELECT id FROM accounting_clients WHERE consultant_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM accounting_clients WHERE consultant_id = auth.uid()));

CREATE POLICY "Clients can view their periods"
  ON accounting_periods
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM accounting_clients WHERE client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())));

-- RLS Policies for accounting_services
CREATE POLICY "Consultants can manage their services"
  ON accounting_services
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "All authenticated users can view active services"
  ON accounting_services
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for accounting_invoices
CREATE POLICY "Consultants can manage their invoices"
  ON accounting_invoices
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Clients can view their invoices"
  ON accounting_invoices
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM accounting_clients WHERE client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())));

-- RLS Policies for accounting_payments
CREATE POLICY "Consultants can view their payments"
  ON accounting_payments
  FOR SELECT
  TO authenticated
  USING (consultant_id = auth.uid());

CREATE POLICY "Clients can view their payments"
  ON accounting_payments
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM accounting_clients WHERE client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())));

CREATE POLICY "System can manage payments"
  ON accounting_payments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for accounting_reports
CREATE POLICY "Consultants can manage their reports"
  ON accounting_reports
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Clients can view their reports"
  ON accounting_reports
  FOR SELECT
  TO authenticated
  USING (client_id IN (SELECT id FROM accounting_clients WHERE client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())));

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_accounting_clients_updated_at
  BEFORE UPDATE ON accounting_clients
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_accounting_documents_updated_at
  BEFORE UPDATE ON accounting_documents
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_accounting_tasks_updated_at
  BEFORE UPDATE ON accounting_tasks
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_accounting_reminders_updated_at
  BEFORE UPDATE ON accounting_reminders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_accounting_messages_updated_at
  BEFORE UPDATE ON accounting_messages
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_accounting_periods_updated_at
  BEFORE UPDATE ON accounting_periods
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_accounting_services_updated_at
  BEFORE UPDATE ON accounting_services
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_accounting_invoices_updated_at
  BEFORE UPDATE ON accounting_invoices
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_accounting_payments_updated_at
  BEFORE UPDATE ON accounting_payments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_accounting_reports_updated_at
  BEFORE UPDATE ON accounting_reports
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to calculate commission split (65% consultant, 35% platform)
CREATE OR REPLACE FUNCTION calculate_accounting_commission_split()
RETURNS TRIGGER AS $$
BEGIN
  NEW.consultant_commission = NEW.amount * 0.65;
  NEW.platform_fee = NEW.amount * 0.35;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_accounting_commission_split_trigger
  BEFORE INSERT OR UPDATE OF amount ON accounting_payments
  FOR EACH ROW EXECUTE FUNCTION calculate_accounting_commission_split();

-- Function to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION generate_accounting_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number = 'ACC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::bigint;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_accounting_invoice_number_trigger
  BEFORE INSERT ON accounting_invoices
  FOR EACH ROW EXECUTE FUNCTION generate_accounting_invoice_number();

-- Function to auto-create reminders for overdue documents
CREATE OR REPLACE FUNCTION create_overdue_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Create reminder if document becomes overdue
  IF NEW.status = 'overdue' AND OLD.status != 'overdue' THEN
    INSERT INTO accounting_reminders (
      client_id,
      consultant_id,
      document_id,
      reminder_type,
      title,
      message,
      due_date,
      reminder_level
    ) VALUES (
      NEW.client_id,
      NEW.consultant_id,
      NEW.id,
      'document_overdue',
      'Overdue Document: ' || NEW.title,
      'Your document "' || NEW.title || '" is now overdue. Please submit it as soon as possible.',
      NEW.due_date,
      1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_overdue_reminders_trigger
  AFTER UPDATE ON accounting_documents
  FOR EACH ROW EXECUTE FUNCTION create_overdue_reminders();