/*
  # Custom Services Management System

  1. New Tables
    - `custom_services` - Danışmanların oluşturduğu özel hizmetler
    - `service_orders` - Hizmet siparişleri ve fatura bilgileri
    - `service_payments` - Stripe ödeme kayıtları

  2. Security
    - Enable RLS on all new tables
    - Add policies for consultants and clients

  3. Features
    - Custom service creation by consultants
    - Pricing and invoice generation
    - Stripe payment integration
    - Order tracking
*/

-- Custom Services Table
CREATE TABLE IF NOT EXISTS custom_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  features text[] DEFAULT '{}',
  price decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  delivery_time_days integer DEFAULT 7,
  category text DEFAULT 'custom',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service Orders Table
CREATE TABLE IF NOT EXISTS service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES custom_services(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'in_progress', 'completed', 'cancelled')),
  total_amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  stripe_payment_intent_id text,
  invoice_number text UNIQUE,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service Payments Table
CREATE TABLE IF NOT EXISTS service_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  stripe_payment_intent_id text NOT NULL,
  stripe_charge_id text,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE custom_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_services
CREATE POLICY "Consultants can manage their services"
  ON custom_services
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Clients can view active services"
  ON custom_services
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage all services"
  ON custom_services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for service_orders
CREATE POLICY "Consultants can view their orders"
  ON service_orders
  FOR SELECT
  TO authenticated
  USING (consultant_id = auth.uid());

CREATE POLICY "Clients can view their orders"
  ON service_orders
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Consultants can update their orders"
  ON service_orders
  FOR UPDATE
  TO authenticated
  USING (consultant_id = auth.uid())
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Clients can create orders"
  ON service_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can manage all orders"
  ON service_orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for service_payments
CREATE POLICY "Users can view their payments"
  ON service_payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_orders 
      WHERE service_orders.id = service_payments.order_id 
      AND (service_orders.client_id = auth.uid() OR service_orders.consultant_id = auth.uid())
    )
  );

CREATE POLICY "System can manage payments"
  ON service_payments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_services_consultant_id ON custom_services(consultant_id);
CREATE INDEX IF NOT EXISTS idx_custom_services_country_id ON custom_services(country_id);
CREATE INDEX IF NOT EXISTS idx_custom_services_active ON custom_services(is_active);
CREATE INDEX IF NOT EXISTS idx_service_orders_service_id ON service_orders(service_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_client_id ON service_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_consultant_id ON service_orders(consultant_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_payments_order_id ON service_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_service_payments_stripe_id ON service_payments(stripe_payment_intent_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_custom_services_updated_at
  BEFORE UPDATE ON custom_services
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_service_orders_updated_at
  BEFORE UPDATE ON service_orders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_service_payments_updated_at
  BEFORE UPDATE ON service_payments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  invoice_num TEXT;
  counter INTEGER;
BEGIN
  -- Get current year and month
  SELECT 'INV-' || TO_CHAR(NOW(), 'YYYY-MM') || '-' || LPAD(
    COALESCE(
      (SELECT MAX(CAST(SUBSTRING(invoice_number FROM 'INV-\d{4}-\d{2}-(\d+)') AS INTEGER)) + 1
       FROM service_orders 
       WHERE invoice_number LIKE 'INV-' || TO_CHAR(NOW(), 'YYYY-MM') || '-%'), 
      1
    )::TEXT, 
    4, '0'
  ) INTO invoice_num;
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number = generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_service_order_invoice_number
  BEFORE INSERT ON service_orders
  FOR EACH ROW EXECUTE FUNCTION set_invoice_number();