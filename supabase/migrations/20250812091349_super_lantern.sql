/*
  # Cross-Country Customers Management System

  1. New Tables
    - `cross_country_orders` - Orders from other countries
      - `id` (uuid, primary key)
      - `order_number` (text, unique, auto-generated)
      - `source_consultant_id` (uuid, referring consultant)
      - `target_consultant_id` (uuid, receiving consultant)
      - `source_country` (text, origin country)
      - `target_country` (text, destination country)
      - `client_name` (text, client information)
      - `client_email` (text, client contact)
      - `service_type` (text, requested service)
      - `service_details` (jsonb, detailed requirements)
      - `total_amount` (numeric, service cost)
      - `referral_commission` (numeric, 10% to referring consultant)
      - `consultant_commission` (numeric, 55% to executing consultant)
      - `platform_fee` (numeric, 35% platform fee)
      - `status` (text, order status)
      - `priority` (text, urgency level)
      - `notes` (text, additional information)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `consultant_referrals` - Track referral relationships
      - `id` (uuid, primary key)
      - `referring_consultant_id` (uuid, who made referral)
      - `receiving_consultant_id` (uuid, who received referral)
      - `client_email` (text, client identifier)
      - `service_type` (text, service requested)
      - `referral_fee` (numeric, commission earned)
      - `status` (text, referral status)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Consultants can view their own referrals and received orders
    - Admins can view all cross-country activities

  3. Features
    - Automatic commission calculation (10% referral, 55% execution, 35% platform)
    - Cross-country service coordination
    - Referral tracking and commission management
    - Multi-language support for international clients
*/

-- Cross-country orders table
CREATE TABLE IF NOT EXISTS cross_country_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  source_consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_country text NOT NULL,
  target_country text NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  service_type text NOT NULL DEFAULT 'company_formation',
  service_details jsonb DEFAULT '{}',
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  referral_commission numeric(10,2) NOT NULL DEFAULT 0,
  consultant_commission numeric(10,2) NOT NULL DEFAULT 0,
  platform_fee numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'medium',
  notes text,
  stripe_payment_intent_id text,
  payment_status text NOT NULL DEFAULT 'pending',
  estimated_completion_days integer DEFAULT 14,
  actual_completion_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT cross_country_orders_status_check 
    CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected')),
  CONSTRAINT cross_country_orders_priority_check 
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT cross_country_orders_payment_status_check 
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))
);

-- Consultant referrals tracking
CREATE TABLE IF NOT EXISTS consultant_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referring_consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiving_consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES cross_country_orders(id) ON DELETE CASCADE,
  client_email text NOT NULL,
  service_type text NOT NULL,
  referral_fee numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT consultant_referrals_status_check 
    CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled'))
);

-- Cross-country communications
CREATE TABLE IF NOT EXISTS cross_country_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES cross_country_orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_type text NOT NULL DEFAULT 'general',
  subject text,
  message text NOT NULL,
  original_language text DEFAULT 'en',
  translated_message text,
  target_language text,
  attachments jsonb DEFAULT '[]',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT cross_country_communications_message_type_check 
    CHECK (message_type IN ('general', 'service_update', 'payment_info', 'completion_notice', 'urgent'))
);

-- Enable RLS
ALTER TABLE cross_country_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_country_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cross_country_orders
CREATE POLICY "Consultants can view their orders"
  ON cross_country_orders
  FOR SELECT
  TO authenticated
  USING (source_consultant_id = uid() OR target_consultant_id = uid());

CREATE POLICY "Source consultants can create orders"
  ON cross_country_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (source_consultant_id = uid());

CREATE POLICY "Target consultants can update orders"
  ON cross_country_orders
  FOR UPDATE
  TO authenticated
  USING (target_consultant_id = uid())
  WITH CHECK (target_consultant_id = uid());

CREATE POLICY "Admins can manage all orders"
  ON cross_country_orders
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for consultant_referrals
CREATE POLICY "Consultants can view their referrals"
  ON consultant_referrals
  FOR SELECT
  TO authenticated
  USING (referring_consultant_id = uid() OR receiving_consultant_id = uid());

CREATE POLICY "System can manage referrals"
  ON consultant_referrals
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for cross_country_communications
CREATE POLICY "Users can view their communications"
  ON cross_country_communications
  FOR SELECT
  TO authenticated
  USING (sender_id = uid() OR recipient_id = uid());

CREATE POLICY "Users can send communications"
  ON cross_country_communications
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = uid());

CREATE POLICY "Recipients can update read status"
  ON cross_country_communications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = uid())
  WITH CHECK (recipient_id = uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cross_country_orders_source_consultant 
  ON cross_country_orders(source_consultant_id);
CREATE INDEX IF NOT EXISTS idx_cross_country_orders_target_consultant 
  ON cross_country_orders(target_consultant_id);
CREATE INDEX IF NOT EXISTS idx_cross_country_orders_status 
  ON cross_country_orders(status);
CREATE INDEX IF NOT EXISTS idx_cross_country_orders_created_at 
  ON cross_country_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_consultant_referrals_referring 
  ON consultant_referrals(referring_consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_referrals_receiving 
  ON consultant_referrals(receiving_consultant_id);

CREATE INDEX IF NOT EXISTS idx_cross_country_communications_order 
  ON cross_country_communications(order_id);
CREATE INDEX IF NOT EXISTS idx_cross_country_communications_sender 
  ON cross_country_communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_cross_country_communications_recipient 
  ON cross_country_communications(recipient_id);

-- Triggers for updated_at
CREATE TRIGGER handle_cross_country_orders_updated_at
  BEFORE UPDATE ON cross_country_orders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to calculate cross-country commission split
CREATE OR REPLACE FUNCTION calculate_cross_country_commission()
RETURNS TRIGGER AS $$
BEGIN
  -- 10% referral commission to source consultant
  NEW.referral_commission := NEW.total_amount * 0.10;
  
  -- 55% execution commission to target consultant  
  NEW.consultant_commission := NEW.total_amount * 0.55;
  
  -- 35% platform fee
  NEW.platform_fee := NEW.total_amount * 0.35;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic commission calculation
CREATE TRIGGER calculate_cross_country_commission_trigger
  BEFORE INSERT OR UPDATE OF total_amount ON cross_country_orders
  FOR EACH ROW EXECUTE FUNCTION calculate_cross_country_commission();

-- Function to generate cross-country order numbers
CREATE OR REPLACE FUNCTION generate_cross_country_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'CC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::bigint;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic order number generation
CREATE TRIGGER generate_cross_country_order_number_trigger
  BEFORE INSERT ON cross_country_orders
  FOR EACH ROW EXECUTE FUNCTION generate_cross_country_order_number();

-- Function to create referral record
CREATE OR REPLACE FUNCTION create_referral_record()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO consultant_referrals (
    referring_consultant_id,
    receiving_consultant_id,
    order_id,
    client_email,
    service_type,
    referral_fee,
    status
  ) VALUES (
    NEW.source_consultant_id,
    NEW.target_consultant_id,
    NEW.id,
    NEW.client_email,
    NEW.service_type,
    NEW.referral_commission,
    'pending'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create referral record when order is created
CREATE TRIGGER create_referral_record_trigger
  AFTER INSERT ON cross_country_orders
  FOR EACH ROW EXECUTE FUNCTION create_referral_record();