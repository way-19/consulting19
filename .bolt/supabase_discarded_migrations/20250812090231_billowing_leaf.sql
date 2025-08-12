/*
  # Advanced Accounting Management CRM System

  1. New Tables
    - `accounting_clients` - Client accounting profiles and settings
    - `accounting_documents` - Document management with categories and deadlines
    - `accounting_tasks` - Task management with priorities and automation
    - `accounting_reminders` - Automated reminder system
    - `accounting_messages` - Multilingual messaging system
    - `accounting_periods` - Accounting periods and deadlines
    - `accounting_services` - Service packages and pricing
    - `accounting_invoices` - Invoice management
    - `accounting_payments` - Payment tracking
    - `accounting_reports` - Generated reports storage

  2. Security
    - Enable RLS on all tables
    - Add policies for consultants, clients, and admins
    - Secure document access and messaging

  3. Features
    - Document deadline tracking
    - Automated reminder system
    - Multilingual messaging
    - Advanced filtering and search
    - Service package management
    - Invoice and payment tracking
    - Report generation
*/

-- Accounting Clients (Extended client profiles for accounting)
CREATE TABLE IF NOT EXISTS accounting_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text,
  tax_number text,
  registration_number text,
  business_type text DEFAULT 'llc',
  accounting_period text DEFAULT 'monthly',
  fiscal_year_end date,
  preferred_language text DEFAULT 'en',
  service_package text DEFAULT 'basic',
  monthly_fee numeric(10,2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_document_received timestamptz,
  next_deadline date,
  reminder_frequency integer DEFAULT 7, -- days
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Accounting Documents
CREATE TABLE IF NOT EXISTS accounting_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  category text DEFAULT 'monthly' CHECK (category IN ('monthly', 'quarterly', 'annual', 'ad_hoc')),
  title text NOT NULL,
  description text,
  due_date date,
  received_date timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'processed', 'completed', 'overdue')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  file_url text,
  file_size integer,
  reminder_sent boolean DEFAULT false,
  reminder_count integer DEFAULT 0,
  last_reminder_sent timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Accounting Tasks
CREATE TABLE IF NOT EXISTS accounting_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  task_type text DEFAULT 'document_review',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  estimated_hours numeric(4,2),
  actual_hours numeric(4,2),
  is_recurring boolean DEFAULT false,
  recurrence_pattern text, -- 'monthly', 'quarterly', 'annually'
  assigned_to uuid REFERENCES profiles(id),
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Accounting Reminders
CREATE TABLE IF NOT EXISTS accounting_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  document_id uuid REFERENCES accounting_documents(id) ON DELETE CASCADE,
  reminder_type text DEFAULT 'document_due' CHECK (reminder_type IN ('document_due', 'payment_due', 'deadline_approaching', 'overdue')),
  title text NOT NULL,
  message text NOT NULL,
  due_date date,
  sent_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'cancelled')),
  reminder_level integer DEFAULT 1, -- 1st, 2nd, 3rd reminder
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

-- Accounting Messages (Multilingual)
CREATE TABLE IF NOT EXISTS accounting_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES accounting_clients(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subject text,
  message text NOT NULL,
  original_language text DEFAULT 'en',
  translated_message text,
  target_language text,
  message_type text DEFAULT 'general' CHECK (message_type IN ('general', 'reminder', 'urgent', 'document_request')),
  is_read boolean DEFAULT false,
  read_at timestamptz,
  parent_message_id uuid REFERENCES accounting_messages(id),
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Accounting Periods
CREATE TABLE IF NOT EXISTS accounting_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES accounting_clients(id) ON DELETE CASCADE,
  period_type text DEFAULT 'monthly' CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'locked')),
  documents_due_date date,
  filing_deadline date,
  is_filed boolean DEFAULT false,
  filed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Accounting Services
CREATE TABLE IF NOT EXISTS accounting_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  service_type text DEFAULT 'monthly' CHECK (service_type IN ('monthly', 'quarterly', 'annual', 'one_time')),
  description text,
  price numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  includes jsonb DEFAULT '[]', -- List of included services
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Accounting Invoices
CREATE TABLE IF NOT EXISTS accounting_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_number text UNIQUE NOT NULL,
  period_start date,
  period_end date,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz,
  payment_method text,
  stripe_invoice_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Accounting Payments
CREATE TABLE IF NOT EXISTS accounting_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES accounting_invoices(id) ON DELETE CASCADE,
  client_id uuid REFERENCES accounting_clients(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_method text,
  payment_date timestamptz DEFAULT now(),
  stripe_payment_id text,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Accounting Reports
CREATE TABLE IF NOT EXISTS accounting_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES accounting_clients(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  report_period_start date,
  report_period_end date,
  report_data jsonb,
  file_url text,
  status text DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'sent', 'error')),
  generated_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounting_clients_consultant_id ON accounting_clients(consultant_id);
CREATE INDEX IF NOT EXISTS idx_accounting_clients_status ON accounting_clients(status);
CREATE INDEX IF NOT EXISTS idx_accounting_documents_client_id ON accounting_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_accounting_documents_due_date ON accounting_documents(due_date);
CREATE INDEX IF NOT EXISTS idx_accounting_documents_status ON accounting_documents(status);
CREATE INDEX IF NOT EXISTS idx_accounting_tasks_consultant_id ON accounting_tasks(consultant_id);
CREATE INDEX IF NOT EXISTS idx_accounting_tasks_due_date ON accounting_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_accounting_reminders_client_id ON accounting_reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_accounting_reminders_due_date ON accounting_reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_accounting_messages_receiver_id ON accounting_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_accounting_messages_created_at ON accounting_messages(created_at);

-- Enable RLS
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
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all accounting clients"
  ON accounting_clients
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

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
  USING (client_id IN (
    SELECT id FROM accounting_clients 
    WHERE client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  ));

CREATE POLICY "Admins can manage all documents"
  ON accounting_documents
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for accounting_tasks
CREATE POLICY "Consultants can manage their tasks"
  ON accounting_tasks
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid() OR assigned_to = auth.uid())
  WITH CHECK (consultant_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Admins can manage all tasks"
  ON accounting_tasks
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for accounting_reminders
CREATE POLICY "Consultants can manage their reminders"
  ON accounting_reminders
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Admins can manage all reminders"
  ON accounting_reminders
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for accounting_messages
CREATE POLICY "Users can view their messages"
  ON accounting_messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON accounting_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Admins can manage all messages"
  ON accounting_messages
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for other tables (similar pattern)
CREATE POLICY "Consultants can manage their periods"
  ON accounting_periods
  FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT id FROM accounting_clients WHERE consultant_id = auth.uid()
  ));

CREATE POLICY "Consultants can manage their services"
  ON accounting_services
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

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
  USING (client_id IN (
    SELECT id FROM accounting_clients 
    WHERE client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  ));

CREATE POLICY "Consultants can manage payments"
  ON accounting_payments
  FOR ALL
  TO authenticated
  USING (client_id IN (
    SELECT id FROM accounting_clients WHERE consultant_id = auth.uid()
  ));

CREATE POLICY "Consultants can manage reports"
  ON accounting_reports
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

-- Triggers for updated_at
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

CREATE TRIGGER handle_accounting_periods_updated_at
  BEFORE UPDATE ON accounting_periods
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_accounting_services_updated_at
  BEFORE UPDATE ON accounting_services
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_accounting_invoices_updated_at
  BEFORE UPDATE ON accounting_invoices
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || extract(epoch from now())::bigint;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON accounting_invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- Function to update document status based on due dates
CREATE OR REPLACE FUNCTION update_overdue_documents()
RETURNS void AS $$
BEGIN
  UPDATE accounting_documents 
  SET status = 'overdue'
  WHERE due_date < CURRENT_DATE 
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Function to create automatic reminders
CREATE OR REPLACE FUNCTION create_automatic_reminders()
RETURNS void AS $$
BEGIN
  -- Create reminders for documents due in 3 days
  INSERT INTO accounting_reminders (client_id, consultant_id, document_id, reminder_type, title, message, due_date, language)
  SELECT 
    d.client_id,
    d.consultant_id,
    d.id,
    'deadline_approaching',
    'Document Due Soon: ' || d.title,
    'Your document "' || d.title || '" is due in 3 days. Please submit it as soon as possible.',
    d.due_date,
    ac.preferred_language
  FROM accounting_documents d
  JOIN accounting_clients ac ON d.client_id = ac.id
  WHERE d.due_date = CURRENT_DATE + INTERVAL '3 days'
    AND d.status = 'pending'
    AND NOT EXISTS (
      SELECT 1 FROM accounting_reminders r 
      WHERE r.document_id = d.id 
        AND r.reminder_type = 'deadline_approaching'
        AND r.due_date = d.due_date
    );

  -- Create overdue reminders
  INSERT INTO accounting_reminders (client_id, consultant_id, document_id, reminder_type, title, message, due_date, language)
  SELECT 
    d.client_id,
    d.consultant_id,
    d.id,
    'overdue',
    'Overdue Document: ' || d.title,
    'Your document "' || d.title || '" is now overdue. Please submit it immediately to avoid penalties.',
    d.due_date,
    ac.preferred_language
  FROM accounting_documents d
  JOIN accounting_clients ac ON d.client_id = ac.id
  WHERE d.due_date < CURRENT_DATE
    AND d.status = 'overdue'
    AND NOT EXISTS (
      SELECT 1 FROM accounting_reminders r 
      WHERE r.document_id = d.id 
        AND r.reminder_type = 'overdue'
        AND r.due_date = d.due_date
    );
END;
$$ LANGUAGE plpgsql;