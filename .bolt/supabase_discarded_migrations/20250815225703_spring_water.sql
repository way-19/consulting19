/*
  # Add RLS policies for partnership applications

  1. Security
    - Enable RLS on partnership_applications table
    - Add policy for authenticated users to insert applications
    - Add policy for admins to manage all applications
  
  2. Triggers
    - Add updated_at trigger for automatic timestamp updates
*/

-- Enable RLS if not already enabled
ALTER TABLE public.partnership_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert partnership applications" ON public.partnership_applications;
DROP POLICY IF EXISTS "Allow admins to view and manage all partnership applications" ON public.partnership_applications;

-- Create policies for partnership applications
CREATE POLICY "Allow authenticated users to insert partnership applications"
ON public.partnership_applications
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow admins to view and manage all partnership applications"
ON public.partnership_applications
FOR ALL
TO authenticated
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))
));

-- Add updated_at trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'handle_partnership_applications_updated_at'
  ) THEN
    CREATE TRIGGER handle_partnership_applications_updated_at 
    BEFORE UPDATE ON public.partnership_applications 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;