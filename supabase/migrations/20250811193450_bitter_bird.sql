/*
  # Create clients table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `assigned_consultant_id` (uuid, optional, references profiles)
      - `company_name` (text, optional)
      - `phone` (text, optional)
      - `status` (text, default 'new')
      - `priority` (text, default 'medium')
      - `service_type` (text)
      - `progress` (integer, default 0)
      - `satisfaction_rating` (integer, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `clients` table
    - Add policies for clients to view their own data
    - Add policies for consultants to view assigned clients
    - Add policies for admins to view all clients
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_consultant_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_name text,
  phone text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'on_hold')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  service_type text NOT NULL DEFAULT 'company_formation',
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Clients can view their own data"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Consultants can view assigned clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    assigned_consultant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all clients"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Consultants can update assigned clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    assigned_consultant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER handle_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();