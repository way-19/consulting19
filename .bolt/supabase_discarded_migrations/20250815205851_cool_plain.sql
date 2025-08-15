/*
  # Document Requests System

  1. New Tables
    - `document_requests` - Consultant requests documents from clients
    - Enhanced `documents` table for better tracking

  2. Security
    - Enable RLS on new tables
    - Add policies for consultant-client document workflow

  3. Features
    - Consultants can request specific documents from clients
    - Clients see requested documents and can upload
    - Status tracking throughout the process
*/

-- Create document_requests table
CREATE TABLE IF NOT EXISTS document_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  document_name text NOT NULL,
  document_type text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  description text,
  due_date timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'approved', 'rejected')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for document_requests
CREATE INDEX IF NOT EXISTS idx_document_requests_consultant_id ON document_requests(consultant_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_client_id ON document_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_status ON document_requests(status);
CREATE INDEX IF NOT EXISTS idx_document_requests_due_date ON document_requests(due_date);

-- Enable RLS on document_requests
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_requests
CREATE POLICY "Consultants can manage their document requests"
  ON document_requests
  FOR ALL
  TO authenticated
  USING (consultant_id = uid())
  WITH CHECK (consultant_id = uid());

CREATE POLICY "Clients can view their document requests"
  ON document_requests
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = uid()
  ));

CREATE POLICY "Clients can update their document requests"
  ON document_requests
  FOR UPDATE
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE profile_id = uid()
  ))
  WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE profile_id = uid()
  ));

-- Add updated_at trigger
CREATE TRIGGER handle_document_requests_updated_at
  BEFORE UPDATE ON document_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Enhance documents table with request reference
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'request_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN request_id uuid REFERENCES document_requests(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for request_id
CREATE INDEX IF NOT EXISTS idx_documents_request_id ON documents(request_id);

-- Insert sample document requests from consultant to client
INSERT INTO document_requests (
  consultant_id,
  client_id,
  document_name,
  document_type,
  category,
  description,
  due_date,
  status,
  priority,
  notes
) VALUES 
(
  '3732cae6-3238-44b6-9c6b-2f29f0216a83', -- Nino (Georgia consultant)
  (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com') LIMIT 1),
  'Ağustos 2025 Banka Dökümü',
  'Bank Statement',
  'financial',
  'Ağustos ayı için tüm banka hesap hareketlerini içeren resmi banka dökümü gerekli.',
  now() + interval '7 days',
  'pending',
  'high',
  'Lütfen tüm hesaplarınızın ağustos ayı dökümlerini yükleyin.'
),
(
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',
  (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com') LIMIT 1),
  'Şirket Gider Faturaları',
  'Expense Receipts',
  'business',
  'Ağustos ayında yapılan tüm şirket giderlerinin faturalarını yükleyin.',
  now() + interval '5 days',
  'pending',
  'medium',
  'Ofis kirası, elektrik, internet vb. tüm giderler dahil.'
),
(
  '3732cae6-3238-44b6-9c6b-2f29f0216a83',
  (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com') LIMIT 1),
  'Çalışan Bordro Bilgileri',
  'Payroll Documents',
  'business',
  'Ağustos ayı çalışan bordro bilgileri ve SGK ödemeleri.',
  now() + interval '3 days',
  'pending',
  'urgent',
  'Tüm çalışanların bordro bilgileri ve sosyal güvenlik ödemeleri.'
);

-- Insert sample uploaded documents
INSERT INTO documents (
  client_id,
  name,
  type,
  category,
  status,
  file_url,
  file_size,
  uploaded_at,
  reviewed_at
) VALUES 
(
  (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com') LIMIT 1),
  'Temmuz 2025 Banka Dökümü',
  'Bank Statement',
  'financial',
  'approved',
  'https://example.com/documents/july-bank-statement.pdf',
  245760,
  now() - interval '15 days',
  now() - interval '12 days'
),
(
  (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com') LIMIT 1),
  'Şirket Kuruluş Belgesi',
  'Company Registration',
  'business',
  'approved',
  'https://example.com/documents/company-registration.pdf',
  512000,
  now() - interval '30 days',
  now() - interval '28 days'
),
(
  (SELECT id FROM clients WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com') LIMIT 1),
  'Vergi Levhası',
  'Tax Certificate',
  'business',
  'needs_revision',
  'https://example.com/documents/tax-certificate.pdf',
  128000,
  now() - interval '7 days',
  now() - interval '5 days'
);