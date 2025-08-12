/*
  # Virtual Mailbox System for Document Management

  1. New Tables
    - `virtual_mailbox_items` - Documents sent to clients via virtual mailbox
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `consultant_id` (uuid, foreign key to profiles)
      - `document_type` (text) - Type of document
      - `document_name` (text) - Name/title of document
      - `description` (text) - Document description
      - `file_url` (text) - URL to document file
      - `file_size` (integer) - File size in bytes
      - `status` (text) - pending, sent, delivered, viewed, downloaded
      - `tracking_number` (text) - Unique tracking number
      - `shipping_fee` (numeric) - Virtual shipping fee
      - `payment_status` (text) - unpaid, paid, waived
      - `sent_date` (timestamp)
      - `delivered_date` (timestamp)
      - `viewed_date` (timestamp)
      - `downloaded_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `virtual_mailbox_items` table
    - Add policies for consultants to manage their client documents
    - Add policies for clients to view their documents
    - Add policies for admins to manage all documents

  3. Functions
    - Auto-generate tracking numbers
    - Update timestamps on status changes
*/

-- Create virtual mailbox items table
CREATE TABLE IF NOT EXISTS virtual_mailbox_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_name text NOT NULL,
  description text,
  file_url text,
  file_size integer,
  status text NOT NULL DEFAULT 'pending',
  tracking_number text UNIQUE,
  shipping_fee numeric(10,2) DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'unpaid',
  sent_date timestamptz,
  delivered_date timestamptz,
  viewed_date timestamptz,
  downloaded_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT virtual_mailbox_items_status_check 
    CHECK (status IN ('pending', 'sent', 'delivered', 'viewed', 'downloaded')),
  CONSTRAINT virtual_mailbox_items_payment_status_check 
    CHECK (payment_status IN ('unpaid', 'paid', 'waived')),
  CONSTRAINT virtual_mailbox_items_file_size_check 
    CHECK (file_size > 0)
);

-- Enable RLS
ALTER TABLE virtual_mailbox_items ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_virtual_mailbox_items_client_id ON virtual_mailbox_items(client_id);
CREATE INDEX IF NOT EXISTS idx_virtual_mailbox_items_consultant_id ON virtual_mailbox_items(consultant_id);
CREATE INDEX IF NOT EXISTS idx_virtual_mailbox_items_status ON virtual_mailbox_items(status);
CREATE INDEX IF NOT EXISTS idx_virtual_mailbox_items_payment_status ON virtual_mailbox_items(payment_status);
CREATE INDEX IF NOT EXISTS idx_virtual_mailbox_items_tracking_number ON virtual_mailbox_items(tracking_number);

-- RLS Policies
CREATE POLICY "Consultants can manage their client documents"
  ON virtual_mailbox_items
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Clients can view their documents"
  ON virtual_mailbox_items
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update payment status"
  ON virtual_mailbox_items
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

CREATE POLICY "Admins can manage all mailbox items"
  ON virtual_mailbox_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to generate tracking numbers
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := 'VM' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tracking number generation
CREATE TRIGGER generate_tracking_number_trigger
  BEFORE INSERT ON virtual_mailbox_items
  FOR EACH ROW
  EXECUTE FUNCTION generate_tracking_number();

-- Function to update timestamps based on status
CREATE OR REPLACE FUNCTION update_mailbox_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update timestamps based on status changes
  IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
    NEW.sent_date := NOW();
  END IF;
  
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_date := NOW();
  END IF;
  
  IF NEW.status = 'viewed' AND OLD.status != 'viewed' THEN
    NEW.viewed_date := NOW();
  END IF;
  
  IF NEW.status = 'downloaded' AND OLD.status != 'downloaded' THEN
    NEW.downloaded_date := NOW();
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for timestamp updates
CREATE TRIGGER update_mailbox_timestamps_trigger
  BEFORE UPDATE ON virtual_mailbox_items
  FOR EACH ROW
  EXECUTE FUNCTION update_mailbox_timestamps();

-- Updated at trigger
CREATE TRIGGER handle_virtual_mailbox_items_updated_at
  BEFORE UPDATE ON virtual_mailbox_items
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();