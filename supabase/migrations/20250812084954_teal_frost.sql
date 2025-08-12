/*
  # Legacy Orders Management System

  1. New Tables
    - `legacy_orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique)
      - `client_id` (uuid, foreign key to profiles)
      - `consultant_id` (uuid, foreign key to profiles)
      - `country` (text)
      - `service_type` (text)
      - `company_name` (text)
      - `total_amount` (numeric)
      - `consultant_commission` (numeric) - 65% of total
      - `platform_fee` (numeric) - 35% of total
      - `status` (text)
      - `additional_services` (jsonb)
      - `client_details` (jsonb)
      - `payment_status` (text)
      - `stripe_payment_intent_id` (text)
      - `webhook_data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `legacy_orders` table
    - Add policies for consultants, clients, and admins
*/

CREATE TABLE IF NOT EXISTS legacy_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  country text NOT NULL,
  service_type text NOT NULL DEFAULT 'company_formation',
  company_name text,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  consultant_commission numeric(10,2) NOT NULL DEFAULT 0,
  platform_fee numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  additional_services jsonb DEFAULT '[]'::jsonb,
  client_details jsonb DEFAULT '{}'::jsonb,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  webhook_data jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE legacy_orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Consultants can view their assigned orders"
  ON legacy_orders
  FOR SELECT
  TO authenticated
  USING (consultant_id = auth.uid());

CREATE POLICY "Clients can view their orders"
  ON legacy_orders
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all orders"
  ON legacy_orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Consultants can update their assigned orders"
  ON legacy_orders
  FOR UPDATE
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_legacy_orders_consultant_id ON legacy_orders(consultant_id);
CREATE INDEX IF NOT EXISTS idx_legacy_orders_client_id ON legacy_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_legacy_orders_status ON legacy_orders(status);
CREATE INDEX IF NOT EXISTS idx_legacy_orders_payment_status ON legacy_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_legacy_orders_country ON legacy_orders(country);
CREATE INDEX IF NOT EXISTS idx_legacy_orders_created_at ON legacy_orders(created_at);

-- Updated at trigger
CREATE TRIGGER handle_legacy_orders_updated_at
  BEFORE UPDATE ON legacy_orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to calculate commission split (65% consultant, 35% platform)
CREATE OR REPLACE FUNCTION calculate_commission_split()
RETURNS TRIGGER AS $$
BEGIN
  NEW.consultant_commission = NEW.total_amount * 0.65;
  NEW.platform_fee = NEW.total_amount * 0.35;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate commission split
CREATE TRIGGER calculate_commission_split_trigger
  BEFORE INSERT OR UPDATE OF total_amount ON legacy_orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_commission_split();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::text, 10, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON legacy_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();