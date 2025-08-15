/*
  # Add Demo Document Requests

  1. Schema Updates
    - Add missing columns to documents table if they don't exist
    - Add requested status to enum if not exists
    
  2. Demo Data
    - Create demo document requests from consultant to client
    - Create sample uploaded documents
    - Create notifications for client
    
  3. Security
    - Ensure RLS policies work correctly
*/

-- First, ensure the documents table has the required columns
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

-- Update the status enum to include 'requested' if not already present
DO $$
BEGIN
  -- Check if 'requested' value exists in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'requested' 
    AND enumtypid = (
      SELECT oid FROM pg_type WHERE typname = 'documents_status_check'
    )
  ) THEN
    -- Add 'requested' to the enum
    ALTER TYPE documents_status_check ADD VALUE 'requested';
  END IF;
EXCEPTION
  WHEN others THEN
    -- If enum doesn't exist, we'll handle it differently
    NULL;
END $$;

-- Get the client ID for demo data
DO $$
DECLARE
  demo_client_id uuid;
  demo_consultant_id uuid;
BEGIN
  -- Get the demo client ID
  SELECT c.id INTO demo_client_id
  FROM clients c
  JOIN profiles p ON c.profile_id = p.id
  WHERE p.email = 'client.georgia@consulting19.com'
  LIMIT 1;

  -- Get the demo consultant ID  
  SELECT id INTO demo_consultant_id
  FROM profiles
  WHERE email = 'georgia@consulting19.com'
  LIMIT 1;

  -- Only proceed if we found both IDs
  IF demo_client_id IS NOT NULL AND demo_consultant_id IS NOT NULL THEN
    
    -- Clean up any existing demo document requests
    DELETE FROM documents 
    WHERE documents.client_id = demo_client_id 
    AND documents.is_request = true;

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
      demo_client_id,
      demo_consultant_id,
      'Ağustos 2025 Banka Dökümü',
      'Bank Statement',
      'financial',
      'requested',
      true,
      NOW() + INTERVAL '7 days',
      'Lütfen Ağustos 2025 dönemi için tüm banka hesaplarınızın dökümünü PDF formatında yükleyin. Elektronik imzalı olması tercih edilir.',
      NOW()
    ),
    (
      demo_client_id,
      demo_consultant_id,
      'Şirket Gider Faturaları',
      'Expense Invoices',
      'business',
      'requested',
      true,
      NOW() + INTERVAL '5 days',
      'Ağustos ayında şirket adına yapılan tüm harcamaların faturalarını toplu olarak yükleyin.',
      NOW()
    ),
    (
      demo_client_id,
      demo_consultant_id,
      'Çalışan Bordro Bilgileri',
      'Payroll Information',
      'business',
      'requested',
      true,
      NOW() + INTERVAL '3 days',
      'Ağustos ayı çalışan bordro özetini ve SGK bildirge belgelerini yükleyin.',
      NOW()
    );

    -- Insert some demo uploaded documents
    INSERT INTO documents (
      client_id,
      name,
      type,
      category,
      status,
      is_request,
      file_url,
      file_size,
      uploaded_at
    ) VALUES
    (
      demo_client_id,
      'Temmuz 2025 Banka Dökümü',
      'Bank Statement',
      'financial',
      'approved',
      false,
      'https://example.com/documents/july-bank-statement.pdf',
      245760,
      NOW() - INTERVAL '5 days'
    ),
    (
      demo_client_id,
      'Şirket Kuruluş Belgesi',
      'Company Registration',
      'business',
      'approved',
      false,
      'https://example.com/documents/company-registration.pdf',
      156890,
      NOW() - INTERVAL '10 days'
    ),
    (
      demo_client_id,
      'Vergi Levhası',
      'Tax Certificate',
      'business',
      'pending',
      false,
      'https://example.com/documents/tax-certificate.pdf',
      98340,
      NOW() - INTERVAL '2 days'
    );

    -- Create notifications for the client about document requests
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      priority,
      related_table,
      action_url,
      is_read
    ) VALUES
    (
      (SELECT profile_id FROM clients WHERE id = demo_client_id),
      'document_requested',
      'Yeni Belge Talebi',
      'Danışmanınız Ağustos 2025 Banka Dökümü belgesini talep etti',
      'high',
      'documents',
      '/client/documents',
      false
    ),
    (
      (SELECT profile_id FROM clients WHERE id = demo_client_id),
      'document_requested',
      'Belge Talebi',
      'Danışmanınız Şirket Gider Faturaları belgesini talep etti',
      'normal',
      'documents',
      '/client/documents',
      false
    ),
    (
      (SELECT profile_id FROM clients WHERE id = demo_client_id),
      'document_requested',
      'Acil Belge Talebi',
      'Danışmanınız Çalışan Bordro Bilgileri belgesini talep etti - 3 gün içinde',
      'urgent',
      'documents',
      '/client/documents',
      false
    );

    RAISE NOTICE 'Demo document requests created successfully for client_id: %', demo_client_id;
  ELSE
    RAISE NOTICE 'Demo users not found. Please ensure client.georgia@consulting19.com and georgia@consulting19.com exist.';
  END IF;
END $$;