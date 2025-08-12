/*
  # Add INSERT policy for accounting_clients table

  1. Security Changes
    - Add policy for clients to insert their own accounting profile
    - Allows authenticated users to create accounting_clients records only for their own client_id
    - Ensures proper RLS security while enabling self-service profile creation

  2. Policy Details
    - Policy name: "Clients can insert their own accounting profile"
    - Operation: INSERT
    - Role: authenticated
    - Condition: The client_id in the new record must belong to the authenticated user's profile
*/

-- Add INSERT policy for accounting_clients table
CREATE POLICY "Clients can insert their own accounting profile"
  ON accounting_clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT clients.id 
      FROM clients 
      WHERE clients.profile_id = auth.uid()
    )
  );