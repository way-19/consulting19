/*
  # Danışman Yönetimi Özellikleri

  1. Yeni Tablolar
    - `consultant_documents`
      - `id` (uuid, primary key)
      - `consultant_id` (uuid, foreign key to profiles)
      - `document_type` (text)
      - `file_url` (text)
      - `file_name` (text)
      - `file_size` (integer)
      - `uploaded_at` (timestamp)
      - `expiry_date` (date)
      - `status` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `consultant_bank_details`
      - `id` (uuid, primary key)
      - `consultant_id` (uuid, foreign key to profiles, unique)
      - `bank_name` (text)
      - `account_holder_name` (text)
      - `account_number` (text)
      - `iban` (text, unique)
      - `swift_code` (text)
      - `currency` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Güvenlik
    - Her iki tablo için RLS etkinleştirildi
    - Danışmanlar sadece kendi bilgilerini görebilir/düzenleyebilir
    - Adminler tüm danışman bilgilerini yönetebilir

  3. Değişiklikler
    - Güvenli belge ve banka bilgisi yönetimi
    - Otomatik updated_at trigger'ları
    - Uygun foreign key kısıtlamaları
*/

-- Danışman belgeleri tablosu
CREATE TABLE IF NOT EXISTS public.consultant_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_type text NOT NULL CHECK (document_type IN ('contract', 'tax_certificate', 'id_proof', 'business_license', 'other')),
    file_url text NOT NULL,
    file_name text NOT NULL,
    file_size integer CHECK (file_size > 0),
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    expiry_date date,
    status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Danışman banka bilgileri tablosu
CREATE TABLE IF NOT EXISTS public.consultant_bank_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    bank_name text NOT NULL,
    account_holder_name text NOT NULL,
    account_number text NOT NULL,
    iban text,
    swift_code text,
    currency text DEFAULT 'USD' NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_consultant_documents_consultant_id ON public.consultant_documents(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_documents_type ON public.consultant_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_consultant_documents_status ON public.consultant_documents(status);
CREATE INDEX IF NOT EXISTS idx_consultant_bank_details_consultant_id ON public.consultant_bank_details(consultant_id);

-- RLS etkinleştir
ALTER TABLE public.consultant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_bank_details ENABLE ROW LEVEL SECURITY;

-- Danışman belgeleri için RLS politikaları
CREATE POLICY "Consultants can view and manage their own documents"
    ON public.consultant_documents FOR ALL
    TO authenticated
    USING (consultant_id = auth.uid())
    WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Admins can manage all consultant documents"
    ON public.consultant_documents FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND legacy_role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND legacy_role = 'admin'));

-- Danışman banka bilgileri için RLS politikaları
CREATE POLICY "Consultants can view and manage their own bank details"
    ON public.consultant_bank_details FOR ALL
    TO authenticated
    USING (consultant_id = auth.uid())
    WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Admins can manage all consultant bank details"
    ON public.consultant_bank_details FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND legacy_role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND legacy_role = 'admin'));

-- Updated_at trigger'ları
CREATE TRIGGER handle_consultant_documents_updated_at 
    BEFORE UPDATE ON public.consultant_documents 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_consultant_bank_details_updated_at 
    BEFORE UPDATE ON public.consultant_bank_details 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();