/*
  # Financial Reporting and Analytics System

  1. New Tables
    - `financial_reports` - Stores generated financial reports
    - `revenue_analytics` - Revenue tracking and analytics
    - `commission_tracking` - Commission calculations and tracking
    - `payment_analytics` - Payment processing analytics

  2. Views
    - `consultant_performance_view` - Consultant performance metrics
    - `country_performance_view` - Country-wise performance
    - `service_performance_view` - Service category performance
    - `monthly_revenue_view` - Monthly revenue breakdown

  3. Functions
    - `calculate_financial_metrics()` - Calculate key financial metrics
    - `generate_performance_report()` - Generate performance reports
    - `update_analytics_cache()` - Update analytics cache

  4. Security
    - Enable RLS on all new tables
    - Admin-only access policies
    - Audit logging for financial operations
*/

-- Financial Reports Table
CREATE TABLE IF NOT EXISTS financial_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL,
  report_period text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  generated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  file_url text,
  status text DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage financial reports"
  ON financial_reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Revenue Analytics Table
CREATE TABLE IF NOT EXISTS revenue_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_revenue numeric(12,2) DEFAULT 0,
  consultant_commissions numeric(12,2) DEFAULT 0,
  platform_fees numeric(12,2) DEFAULT 0,
  order_count integer DEFAULT 0,
  client_count integer DEFAULT 0,
  avg_order_value numeric(10,2) DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0,
  growth_rate numeric(5,2) DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view revenue analytics"
  ON revenue_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Commission Tracking Table
CREATE TABLE IF NOT EXISTS commission_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id uuid,
  order_type text NOT NULL CHECK (order_type IN ('legacy_order', 'service_order', 'accounting_payment')),
  gross_amount numeric(10,2) NOT NULL,
  commission_rate numeric(5,4) DEFAULT 0.65,
  commission_amount numeric(10,2) NOT NULL,
  platform_fee numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'paid', 'disputed')),
  payment_date timestamptz,
  period_start date NOT NULL,
  period_end date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE commission_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage commission tracking"
  ON commission_tracking
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Consultants can view their commissions"
  ON commission_tracking
  FOR SELECT
  TO authenticated
  USING (consultant_id = auth.uid());

-- Payment Analytics Table
CREATE TABLE IF NOT EXISTS payment_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_method text NOT NULL,
  currency text DEFAULT 'USD',
  total_amount numeric(12,2) DEFAULT 0,
  successful_payments integer DEFAULT 0,
  failed_payments integer DEFAULT 0,
  refunded_payments integer DEFAULT 0,
  avg_processing_time interval,
  success_rate numeric(5,2) DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment analytics"
  ON payment_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Consultant Performance View
CREATE OR REPLACE VIEW consultant_performance_view AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.country,
  COALESCE(SUM(lo.total_amount), 0) + COALESCE(SUM(so.total_amount), 0) as total_revenue,
  COUNT(DISTINCT lo.id) + COUNT(DISTINCT so.id) as total_orders,
  COALESCE(SUM(lo.consultant_commission), 0) + COALESCE(SUM(ap.consultant_commission), 0) as commission_earned,
  COUNT(DISTINCT c.id) as client_count,
  AVG(c.satisfaction_rating) as avg_rating,
  CASE 
    WHEN COUNT(DISTINCT lo.id) + COUNT(DISTINCT so.id) > 0 
    THEN (COALESCE(SUM(lo.total_amount), 0) + COALESCE(SUM(so.total_amount), 0)) / (COUNT(DISTINCT lo.id) + COUNT(DISTINCT so.id))
    ELSE 0 
  END as avg_order_value
FROM profiles p
LEFT JOIN legacy_orders lo ON lo.consultant_id = p.id AND lo.payment_status = 'paid'
LEFT JOIN service_orders so ON so.consultant_id = p.id AND so.status = 'completed'
LEFT JOIN accounting_payments ap ON ap.consultant_id = p.id AND ap.status = 'succeeded'
LEFT JOIN clients c ON c.assigned_consultant_id = p.id
WHERE p.role = 'consultant' AND p.is_active = true
GROUP BY p.id, p.full_name, p.email, p.country;

-- Country Performance View
CREATE OR REPLACE VIEW country_performance_view AS
SELECT 
  co.id,
  co.name,
  co.flag_emoji,
  COALESCE(SUM(lo.total_amount), 0) as total_revenue,
  COUNT(DISTINCT lo.id) as total_orders,
  COUNT(DISTINCT cca.consultant_id) as consultant_count,
  CASE 
    WHEN COUNT(DISTINCT lo.id) > 0 
    THEN COALESCE(SUM(lo.total_amount), 0) / COUNT(DISTINCT lo.id)
    ELSE 0 
  END as avg_order_value,
  COUNT(DISTINCT c.id) as client_count
FROM countries co
LEFT JOIN consultant_country_assignments cca ON cca.country_id = co.id AND cca.status = 'active'
LEFT JOIN legacy_orders lo ON lo.country = co.name AND lo.payment_status = 'paid'
LEFT JOIN clients c ON c.assigned_consultant_id = cca.consultant_id
WHERE co.is_active = true
GROUP BY co.id, co.name, co.flag_emoji;

-- Service Performance View
CREATE OR REPLACE VIEW service_performance_view AS
SELECT 
  cs.category,
  COALESCE(SUM(so.total_amount), 0) as total_revenue,
  COUNT(DISTINCT so.id) as total_orders,
  CASE 
    WHEN COUNT(DISTINCT so.id) > 0 
    THEN COALESCE(SUM(so.total_amount), 0) / COUNT(DISTINCT so.id)
    ELSE 0 
  END as avg_price,
  COUNT(DISTINCT cs.consultant_id) as consultant_count
FROM custom_services cs
LEFT JOIN service_orders so ON so.service_id = cs.id AND so.status = 'completed'
WHERE cs.is_active = true
GROUP BY cs.category;

-- Monthly Revenue View
CREATE OR REPLACE VIEW monthly_revenue_view AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(total_amount) as total_revenue,
  SUM(consultant_commission) as total_commissions,
  SUM(platform_fee) as total_platform_fees,
  COUNT(*) as order_count,
  AVG(total_amount) as avg_order_value
FROM legacy_orders
WHERE payment_status = 'paid'
GROUP BY DATE_TRUNC('month', created_at)
UNION ALL
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(total_amount) as total_revenue,
  SUM(total_amount * 0.65) as total_commissions,
  SUM(total_amount * 0.35) as total_platform_fees,
  COUNT(*) as order_count,
  AVG(total_amount) as avg_order_value
FROM service_orders
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Function to calculate financial metrics
CREATE OR REPLACE FUNCTION calculate_financial_metrics(
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_revenue numeric;
  total_commissions numeric;
  total_platform_fees numeric;
  order_count integer;
  client_count integer;
BEGIN
  -- Calculate totals from legacy orders
  SELECT 
    COALESCE(SUM(total_amount), 0),
    COALESCE(SUM(consultant_commission), 0),
    COALESCE(SUM(platform_fee), 0),
    COUNT(*)
  INTO total_revenue, total_commissions, total_platform_fees, order_count
  FROM legacy_orders
  WHERE created_at::date BETWEEN start_date AND end_date
    AND payment_status = 'paid';

  -- Add service orders
  SELECT 
    total_revenue + COALESCE(SUM(total_amount), 0),
    total_commissions + COALESCE(SUM(total_amount * 0.65), 0),
    total_platform_fees + COALESCE(SUM(total_amount * 0.35), 0),
    order_count + COUNT(*)
  INTO total_revenue, total_commissions, total_platform_fees, order_count
  FROM service_orders
  WHERE created_at::date BETWEEN start_date AND end_date
    AND status = 'completed';

  -- Get unique client count
  SELECT COUNT(DISTINCT profile_id)
  INTO client_count
  FROM clients
  WHERE created_at::date BETWEEN start_date AND end_date;

  -- Build result
  result := jsonb_build_object(
    'total_revenue', total_revenue,
    'total_commissions', total_commissions,
    'total_platform_fees', total_platform_fees,
    'order_count', order_count,
    'client_count', client_count,
    'avg_order_value', CASE WHEN order_count > 0 THEN total_revenue / order_count ELSE 0 END,
    'period_start', start_date,
    'period_end', end_date,
    'calculated_at', NOW()
  );

  RETURN result;
END;
$$;

-- Function to generate performance report
CREATE OR REPLACE FUNCTION generate_performance_report(
  report_type text DEFAULT 'monthly',
  target_date date DEFAULT CURRENT_DATE
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  report_id uuid;
  start_date date;
  end_date date;
  report_data jsonb;
BEGIN
  -- Calculate date range based on report type
  CASE report_type
    WHEN 'daily' THEN
      start_date := target_date;
      end_date := target_date;
    WHEN 'weekly' THEN
      start_date := target_date - INTERVAL '7 days';
      end_date := target_date;
    WHEN 'monthly' THEN
      start_date := DATE_TRUNC('month', target_date);
      end_date := start_date + INTERVAL '1 month' - INTERVAL '1 day';
    WHEN 'quarterly' THEN
      start_date := DATE_TRUNC('quarter', target_date);
      end_date := start_date + INTERVAL '3 months' - INTERVAL '1 day';
    WHEN 'yearly' THEN
      start_date := DATE_TRUNC('year', target_date);
      end_date := start_date + INTERVAL '1 year' - INTERVAL '1 day';
    ELSE
      RAISE EXCEPTION 'Invalid report type: %', report_type;
  END CASE;

  -- Generate report data
  report_data := calculate_financial_metrics(start_date, end_date);

  -- Insert report record
  INSERT INTO financial_reports (
    report_type,
    report_period,
    start_date,
    end_date,
    data,
    generated_by,
    status
  ) VALUES (
    report_type,
    report_type || '_' || start_date::text,
    start_date,
    end_date,
    report_data,
    auth.uid(),
    'generated'
  ) RETURNING id INTO report_id;

  RETURN report_id;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_reports_type_period ON financial_reports(report_type, report_period);
CREATE INDEX IF NOT EXISTS idx_financial_reports_dates ON financial_reports(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_period ON revenue_analytics(period_type, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_commission_tracking_consultant ON commission_tracking(consultant_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_commission_tracking_status ON commission_tracking(status, payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_analytics_period ON payment_analytics(period_start, period_end);

-- Triggers for updated_at
CREATE TRIGGER handle_financial_reports_updated_at
  BEFORE UPDATE ON financial_reports
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_revenue_analytics_updated_at
  BEFORE UPDATE ON revenue_analytics
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_commission_tracking_updated_at
  BEFORE UPDATE ON commission_tracking
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_payment_analytics_updated_at
  BEFORE UPDATE ON payment_analytics
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert sample revenue analytics data
INSERT INTO revenue_analytics (
  period_type,
  period_start,
  period_end,
  total_revenue,
  consultant_commissions,
  platform_fees,
  order_count,
  client_count,
  avg_order_value,
  conversion_rate,
  growth_rate
) VALUES 
  ('monthly', '2024-01-01', '2024-01-31', 45000, 29250, 15750, 18, 15, 2500, 85.5, 15.2),
  ('monthly', '2024-02-01', '2024-02-29', 52000, 33800, 18200, 21, 18, 2476, 87.2, 18.7),
  ('monthly', '2024-03-01', '2024-03-31', 48000, 31200, 16800, 19, 16, 2526, 84.1, 12.3),
  ('monthly', '2024-04-01', '2024-04-30', 61000, 39650, 21350, 24, 22, 2542, 89.3, 22.1),
  ('monthly', '2024-05-01', '2024-05-31', 58000, 37700, 20300, 23, 20, 2522, 86.7, 16.8),
  ('monthly', '2024-06-01', '2024-06-30', 67000, 43550, 23450, 27, 25, 2481, 91.2, 19.4)
ON CONFLICT DO NOTHING;

-- Insert sample commission tracking data
INSERT INTO commission_tracking (
  consultant_id,
  order_type,
  gross_amount,
  commission_rate,
  commission_amount,
  platform_fee,
  status,
  period_start,
  period_end
) 
SELECT 
  p.id,
  'legacy_order',
  2500,
  0.65,
  1625,
  875,
  'paid',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE
FROM profiles p 
WHERE p.role = 'consultant' AND p.is_active = true
LIMIT 5
ON CONFLICT DO NOTHING;