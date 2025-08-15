/*
  # Document Requests System

  1. New Tables
    - `document_requests`
      - `id` (uuid, primary key)
      - `consultant_id` (uuid, foreign key to profiles)
      - `client_id` (uuid, foreign key to clients)
      - `document_name` (text)
      - `document_type` (text)
      - `category` (text)
      - `description` (text)
      - `due_date` (timestamp)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `document_requests` table
    - Add policies for consultants to create requests
    - Add policies for clients to view their requests
    - Add policies for both to update status

  3. Sample Data
    - Create sample document requests from Nino to test client
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
  status text NOT NULL DEFAULT 'requested',
  priority text NOT NULL DEFAULT 'medium',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints
ALTER TABLE document_requests ADD CONSTRAINT document_requests_status_check 
  CHECK (status IN ('requested', 'uploaded', 'approved', 'rejected', 'needs_revision'));

ALTER TABLE document_requests ADD CONSTRAINT document_requests_priority_check 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE document_requests ADD CONSTRAINT document_requests_category_check 
  CHECK (category IN ('identity', 'business', 'financial', 'medical', 'other'));

-- Enable RLS
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Consultants can create requests for their clients"
  ON document_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    consultant_id = auth.uid() AND
    client_id IN (
      SELECT id FROM clients WHERE assigned_consultant_id = auth.uid()
    )
  );

CREATE POLICY "Consultants can view their requests"
  ON document_requests
  FOR SELECT
  TO authenticated
  USING (consultant_id = auth.uid());

CREATE POLICY "Clients can view their requests"
  ON document_requests
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Consultants can update their requests"
  ON document_requests
  FOR UPDATE
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Clients can update status of their requests"
  ON document_requests
  FOR UPDATE
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER handle_document_requests_updated_at
  BEFORE UPDATE ON document_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert sample document requests from Nino to test client
DO $$
DECLARE
  nino_id uuid;
  test_client_id uuid;
BEGIN
  -- Get Nino's profile ID
  SELECT id INTO nino_id 
  FROM profiles 
  WHERE email = 'georgia@consulting19.com' 
  LIMIT 1;

  -- Get test client ID
  SELECT id INTO test_client_id 
  FROM clients 
  WHERE profile_id IN (
    SELECT id FROM profiles WHERE email = 'client.georgia@consulting19.com'
  ) 
  LIMIT 1;

  -- Only insert if both IDs exist
  IF nino_id IS NOT NULL AND test_client_id IS NOT NULL THEN
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
      nino_id,
      test_client_id,
      'Ağustos 2025 Banka Dökümü',
      'Bank Statement',
      'financial',
      'Ağustos ayı için tüm banka hesap hareketlerini içeren resmi banka dökümü gerekli.',
      now() + interval '7 days',
      'requested',
      'high',
      'Lütfen tüm hesap hareketlerini içeren resmi banka dökümünü PDF formatında yükleyin.'
    ),
    (
      nino_id,
      test_client_id,
      'Şirket Gider Faturaları',
      'Expense Receipts',
      'business',
      'Ağustos ayında yapılan tüm şirket giderlerinin faturalarını yükleyin.',
      now() + interval '5 days',
      'requested',
      'medium',
      'Tüm gider faturalarını tek bir PDF dosyasında birleştirerek yükleyebilirsiniz.'
    ),
    (
      nino_id,
      test_client_id,
      'Çalışan Bordro Bilgileri',
      'Payroll Documents',
      'business',
      'Ağustos ayı çalışan bordro bilgileri ve SGK ödemeleri.',
      now() + interval '3 days',
      'requested',
      'urgent',
      'Çalışan bordroları ve SGK ödeme belgelerini yükleyin.'
    );

    RAISE NOTICE 'Sample document requests created successfully';
  ELSE
    RAISE NOTICE 'Could not find Nino or test client - skipping sample data';
  END IF;
END $$;