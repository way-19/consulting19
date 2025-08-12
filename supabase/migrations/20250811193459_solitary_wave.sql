/*
  # Create tasks table

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `consultant_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text, optional)
      - `status` (text, default 'pending')
      - `priority` (text, default 'medium')
      - `due_date` (timestamp, optional)
      - `estimated_hours` (integer, optional)
      - `actual_hours` (integer, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for consultants to manage their tasks
    - Add policies for clients to view their tasks
    - Add policies for admins to view all tasks
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  consultant_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  estimated_hours integer CHECK (estimated_hours > 0),
  actual_hours integer CHECK (actual_hours >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Consultants can manage their tasks"
  ON public.tasks
  FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid());

CREATE POLICY "Clients can view their tasks"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all tasks"
  ON public.tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER handle_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();