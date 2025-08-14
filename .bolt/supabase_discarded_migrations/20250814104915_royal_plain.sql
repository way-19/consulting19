/*
  # Create Payment Requests Table

  1. New Tables
    - `payment_requests`
      - `id` (uuid, primary key)
      - `consultant_id` (uuid, foreign key to profiles)
      - `amount` (numeric, requested amount)
      - `status` (text, request status)
      - `requested_at` (timestamp)
      - `processed_at` (timestamp, nullable)
      - `processed_by` (uuid, foreign key to profiles, nullable)
      - `notes` (text, nullable)
      - `stripe_transfer_id` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payment_requests` table
    - Add policy for consultants to create and view their own requests
    - Add policy for admins to manage all requests

  3. Indexes
    - Index on consultant_id for fast consultant queries
    - Index on status for filtering
    - Index on requested_at for date-based queries
*/

CREATE TABLE IF NOT EXISTS payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  stripe_transfer_id text,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_consultant_id ON payment_requests(consultant_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_requested_at ON payment_requests(requested_at);
CREATE INDEX IF NOT EXISTS idx_payment_requests_processed_by ON payment_requests(processed_by);

-- Enable RLS
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Consultants can create and view own requests"
  ON payment_requests
  FOR ALL
  TO authenticated
  USING (consultant_id = uid())
  WITH CHECK (consultant_id = uid());

CREATE POLICY "Admins can manage all payment requests"
  ON payment_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = uid() 
      AND profiles.role = 'admin'
    )
  );

-- Updated at trigger
CREATE TRIGGER handle_payment_requests_updated_at
  BEFORE UPDATE ON payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();