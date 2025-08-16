/*
  # Enhanced Notification System

  1. New Tables
    - `user_notification_preferences` - User notification preferences and settings
    - Enhanced `notifications` table with additional fields

  2. Enhancements
    - Add `data` JSONB field to notifications for structured data
    - Add `read_at` and `dismissed_at` timestamps
    - Add notification preferences table for user customization
    - Add indexes for better performance

  3. Functions
    - Notification cleanup function for old notifications
    - Preference management functions
*/

-- Add new fields to notifications table
DO $$
BEGIN
  -- Add data field for structured notification data
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'data'
  ) THEN
    ALTER TABLE notifications ADD COLUMN data JSONB DEFAULT '{}';
  END IF;

  -- Add read_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ;
  END IF;

  -- Add dismissed_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'dismissed_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN dismissed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create user notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{
    "email_enabled": true,
    "push_enabled": true,
    "frequency": "all",
    "quiet_hours": {
      "enabled": false,
      "start": 22,
      "end": 8
    },
    "disabled_types": []
  }',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_notification_preferences
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_notification_preferences
CREATE POLICY "Users can manage own notification preferences"
  ON user_notification_preferences
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_data ON notifications USING GIN (data);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications (read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_dismissed_at ON notifications (dismissed_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority_created ON notifications (priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type_created ON notifications (type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences (user_id);

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_old INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete read notifications older than specified days
  DELETE FROM notifications
  WHERE is_read = true
    AND dismissed_at IS NULL
    AND created_at < (NOW() - INTERVAL '1 day' * days_old);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete dismissed notifications older than 7 days
  DELETE FROM notifications
  WHERE dismissed_at IS NOT NULL
    AND dismissed_at < (NOW() - INTERVAL '7 days');
  
  RETURN deleted_count;
END;
$$;

-- Function to get notification statistics
CREATE OR REPLACE FUNCTION get_notification_stats(target_user_id UUID)
RETURNS TABLE (
  total_count BIGINT,
  unread_count BIGINT,
  urgent_count BIGINT,
  high_count BIGINT,
  this_week_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_read = false) as unread_count,
    COUNT(*) FILTER (WHERE priority = 'urgent' AND is_read = false) as urgent_count,
    COUNT(*) FILTER (WHERE priority = 'high' AND is_read = false) as high_count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as this_week_count
  FROM notifications
  WHERE user_id = target_user_id
    AND dismissed_at IS NULL;
END;
$$;

-- Function to create enhanced notification
CREATE OR REPLACE FUNCTION create_enhanced_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  notification_priority TEXT DEFAULT 'normal',
  notification_data JSONB DEFAULT '{}',
  related_table_name TEXT DEFAULT NULL,
  related_record_id TEXT DEFAULT NULL,
  action_url_path TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Insert notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    priority,
    data,
    related_table,
    related_id,
    action_url,
    is_read
  ) VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_message,
    notification_priority,
    notification_data,
    related_table_name,
    related_record_id,
    action_url_path,
    false
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- Trigger to update updated_at on user_notification_preferences
CREATE OR REPLACE FUNCTION handle_notification_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION handle_notification_preferences_updated_at();

-- Insert default notification preferences for existing users
INSERT INTO user_notification_preferences (user_id, preferences)
SELECT 
  id,
  '{
    "email_enabled": true,
    "push_enabled": true,
    "frequency": "all",
    "quiet_hours": {
      "enabled": false,
      "start": 22,
      "end": 8
    },
    "disabled_types": []
  }'::JSONB
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Sample enhanced notifications for testing
DO $$
DECLARE
  client_user_id UUID;
  consultant_user_id UUID;
BEGIN
  -- Get sample user IDs
  SELECT id INTO client_user_id FROM profiles WHERE legacy_role = 'client' LIMIT 1;
  SELECT id INTO consultant_user_id FROM profiles WHERE legacy_role = 'consultant' LIMIT 1;

  -- Create sample notifications if users exist
  IF client_user_id IS NOT NULL THEN
    PERFORM create_enhanced_notification(
      client_user_id,
      'welcome_client',
      'Welcome to Consulting19!',
      'Your business journey begins now. Your consultant will contact you soon.',
      'normal',
      '{"client_name": "Test Client", "consultant_name": "Nino Kvaratskhelia", "consultant_email": "georgia@consulting19.com", "consultant_country": "Georgia"}'::JSONB,
      'profiles',
      client_user_id::TEXT,
      '/client-accounting'
    );

    PERFORM create_enhanced_notification(
      client_user_id,
      'document_approved',
      'Document Approved',
      'Your passport document has been approved and verified.',
      'normal',
      '{"document_name": "Passport Copy", "consultant_name": "Nino Kvaratskhelia"}'::JSONB,
      'documents',
      NULL,
      '/client/documents'
    );
  END IF;

  IF consultant_user_id IS NOT NULL THEN
    PERFORM create_enhanced_notification(
      consultant_user_id,
      'payment_received',
      'Payment Received',
      'Payment of $2,500 USD received from Tech Startup LLC',
      'normal',
      '{"amount": "2,500", "currency": "USD", "client_name": "Tech Startup LLC", "service_name": "Georgia Company Formation", "commission_amount": "1,625"}'::JSONB,
      'payments',
      NULL,
      '/consultant/payments'
    );

    PERFORM create_enhanced_notification(
      consultant_user_id,
      'document_uploaded',
      'New Document Uploaded',
      'Bank statement has been uploaded by Tech Startup LLC',
      'normal',
      '{"document_name": "Bank Statement", "client_name": "Tech Startup LLC", "document_type": "Financial Document"}'::JSONB,
      'documents',
      NULL,
      '/consultant/documents'
    );
  END IF;
END $$;