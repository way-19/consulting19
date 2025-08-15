/*
  # Add demo document requests for testing

  1. New Demo Data
    - Creates sample document requests from consultant to client
    - Adds realistic document types and requirements
    - Sets up proper relationships between consultant and client

  2. Demo Documents
    - Ağustos 2025 Banka Dökümü (Bank Statement)
    - Şirket Gider Faturaları (Company Expense Invoices)
    - Çalışan Bordro Bilgileri (Employee Payroll Information)

  3. Notifications
    - Creates notifications for client about document requests
*/

-- First, ensure we have the required columns (in case migration wasn't run)
DO $$
BEGIN
  -- Add is_request column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'is_request'
  ) THEN
    ALTER TABLE documents ADD COLUMN is_request boolean DEFAULT false;
  END IF;

  -- Add requested_by_consultant_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'requested_by_consultant_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN requested_by_consultant_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;

  -- Add due_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE documents ADD COLUMN due_date timestamptz;
  END IF;

  -- Add notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'notes'
  ) THEN
    ALTER TABLE documents ADD COLUMN notes text;
  END IF;
END $$;

-- Update status enum to include 'requested' if not already present
DO $$
BEGIN
  -- Check if 'requested' value exists in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'requested' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'documents_status_check')
  ) THEN
    -- Add 'requested' to the enum
    ALTER TYPE documents_status_check ADD VALUE 'requested';
  END IF;
EXCEPTION
  WHEN others THEN
    -- If enum doesn't exist, create constraint
    ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check;
    ALTER TABLE documents ADD CONSTRAINT documents_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'needs_revision'::text, 'requested'::text]));
END $$;

-- Get the Georgia consultant ID (assuming it exists)
DO $$
DECLARE
  consultant_id uuid;
  client_id uuid;
  demo_client_id uuid;
BEGIN
  -- Get Georgia consultant
  SELECT id INTO consultant_id 
  FROM profiles 
  WHERE email = 'georgia@consulting19.com' 
  LIMIT 1;

  -- Get demo client
  SELECT id INTO demo_client_id
  FROM profiles 
  WHERE email = 'client.georgia@consulting19.com' 
  LIMIT 1;

  -- Get client record
  SELECT id INTO client_id
  FROM clients 
  WHERE profile_id = demo_client_id 
  LIMIT 1;

  -- Only proceed if we have both consultant and client
  IF consultant_id IS NOT NULL AND client_id IS NOT NULL THEN
    
    -- Clear existing demo document requests
    DELETE FROM documents 
    WHERE client_id = client_id 
    AND is_request = true;

    -- Insert demo document requests
    INSERT INTO documents (
      client_id,
      requested_by_consultant_id,
      name,
      type,
      category,
      status,
      is_request,
      due_date,
      notes,
      uploaded_at
    ) VALUES 
    (
      client_id,
      consultant_id,
      'Ağustos 2025 Banka Dökümü',
      'Bank Statement',
      'financial',
      'requested',
      true,
      NOW() + INTERVAL '7 days',
      'Lütfen Ağustos 2025 dönemi için tüm banka hesaplarınızın dökümünü PDF formatında yükleyin. Elektronik imzalı olması tercih edilir.',
      NOW() - INTERVAL '2 hours'
    ),
    (
      client_id,
      consultant_id,
      'Şirket Gider Faturaları - Ağustos 2025',
      'Expense Invoices',
      'business',
      'requested',
      true,
      NOW() + INTERVAL '5 days',
      'Ağustos ayında şirket adına yapılan tüm harcamaların faturalarını toplu olarak yükleyin. Her fatura ayrı dosya olarak yüklenebilir.',
      NOW() - INTERVAL '1 day'
    ),
    (
      client_id,
      consultant_id,
      'Çalışan Bordro Bilgileri',
      'Payroll Documents',
      'financial',
      'requested',
      true,
      NOW() + INTERVAL '3 days',
      'Şirket çalışanlarının Ağustos 2025 bordro bilgilerini ve SGK bildirge belgelerini yükleyin.',
      NOW() - INTERVAL '3 hours'
    );

    -- Create notifications for the client about these requests
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      priority,
      related_table,
      related_id,
      action_url
    ) 
    SELECT 
      demo_client_id,
      'document_requested',
      'Danışmanınız Yeni Belge Talep Etti',
      'Danışmanınız ' || d.name || ' belgesini talep etti. Son tarih: ' || d.due_date::date,
      CASE 
        WHEN d.due_date < NOW() + INTERVAL '3 days' THEN 'urgent'
        WHEN d.due_date < NOW() + INTERVAL '7 days' THEN 'high'
        ELSE 'normal'
      END,
      'documents',
      d.id::text,
      '/client/documents'
    FROM documents d
    WHERE d.client_id = client_id 
    AND d.is_request = true
    AND d.requested_by_consultant_id = consultant_id;

    -- Also add some demo uploaded documents
    INSERT INTO documents (
      client_id,
      name,
      type,
      category,
      status,
      is_request,
      file_url,
      file_size,
      uploaded_at,
      reviewed_at,
      reviewed_by
    ) VALUES 
    (
      client_id,
      'Temmuz 2025 Banka Dökümü',
      'Bank Statement',
      'financial',
      'approved',
      false,
      'https://example.com/documents/july-bank-statement.pdf',
      245760,
      NOW() - INTERVAL '15 days',
      NOW() - INTERVAL '12 days',
      consultant_id
    ),
    (
      client_id,
      'Şirket Kuruluş Belgesi',
      'Company Registration',
      'business',
      'approved',
      false,
      'https://example.com/documents/company-registration.pdf',
      156890,
      NOW() - INTERVAL '30 days',
      NOW() - INTERVAL '28 days',
      consultant_id
    ),
    (
      client_id,
      'Vergi Levhası',
      'Tax Certificate',
      'business',
      'needs_revision',
      false,
      'https://example.com/documents/tax-certificate.pdf',
      98340,
      NOW() - INTERVAL '5 days',
      NOW() - INTERVAL '3 days',
      consultant_id
    );

    RAISE NOTICE 'Demo document requests created successfully for client_id: %', client_id;
  ELSE
    RAISE NOTICE 'Could not find consultant or client. Consultant ID: %, Client ID: %', consultant_id, client_id;
  END IF;
END $$;