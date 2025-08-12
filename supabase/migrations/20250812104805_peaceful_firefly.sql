/*
  # Fix accounting messages receiver_id column

  1. Database Changes
    - Add missing receiver_id column to accounting_messages table
    - Update RLS policies to use correct column name
    - Add foreign key constraint for data integrity

  2. Security
    - Update RLS policies to use recipient_id instead of receiver_id
    - Maintain proper access control for message recipients
*/

-- Add receiver_id column as alias/view or update existing recipient_id usage
-- First, let's check if we need to add receiver_id or if recipient_id should be used instead

-- Add receiver_id column to accounting_messages table
ALTER TABLE accounting_messages 
ADD COLUMN IF NOT EXISTS receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE;

-- Copy data from recipient_id to receiver_id if recipient_id exists and receiver_id is empty
UPDATE accounting_messages 
SET receiver_id = recipient_id 
WHERE receiver_id IS NULL AND recipient_id IS NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_accounting_messages_receiver_id 
ON accounting_messages(receiver_id);

-- Update RLS policies to include receiver_id
DROP POLICY IF EXISTS "Users can manage their messages" ON accounting_messages;

CREATE POLICY "Users can manage their messages"
  ON accounting_messages
  FOR ALL
  TO authenticated
  USING ((sender_id = uid()) OR (recipient_id = uid()) OR (receiver_id = uid()))
  WITH CHECK (sender_id = uid());