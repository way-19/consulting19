/*
  # Create documents table

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `name` (text)
      - `type` (text)
      - `category` (text, default 'other')
      - `status` (text, default 'pending')
      - `file_url` (text, optional)
      - `file_size` (integer, optional)
      - `uploaded_at` (timestamp)
      - `reviewed_at` (timestamp, optional)
      - `reviewed_by` (uuid, optional, references profiles)

  2. Security
    - Enable RLS on `documents` table
    - Add policies for clients to manage their documents
    - Add policies for consultants to view assigned client documents
    - Add policies for admins to view all documents
*/

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('identity', 'business', 'financial', 'medical', 'other')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  file_url text,
  file_size integer CHECK (file_size > 0),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Clients can manage their documents"
  ON public.documents
  FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Consultants can view assigned client documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE assigned_consultant_id = auth.uid()
    )
  );

CREATE POLICY "Consultants can update assigned client documents"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE assigned_consultant_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all documents"
  ON public.documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );