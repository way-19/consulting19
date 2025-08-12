/*
  # Fix Auth Profiles and RLS System

  1. Schema Updates
    - Ensure profiles table has proper user_id column referencing auth.users
    - Add missing indexes for performance
    - Fix any FK type mismatches

  2. RLS Policies
    - Remove recursive policies that cause infinite loops
    - Add simple, non-recursive policies for profiles
    - Ensure proper access control without recursion

  3. Data Integrity
    - Add proper foreign key constraints
    - Ensure consistent data types across tables
*/

-- Ensure profiles table structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'consultant', 'client')),
  country text,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key to auth.users if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;

-- Simple, non-recursive policies
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Update existing clients table to reference profiles properly
DO $$
BEGIN
  -- Update clients.profile_id to reference profiles.id instead of auth.users.id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'profile_id'
  ) THEN
    -- Drop existing foreign key if it exists
    ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_profile_id_fkey;
    
    -- Add proper foreign key to profiles table
    ALTER TABLE public.clients 
    ADD CONSTRAINT clients_profile_id_fkey 
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update clients RLS policies to avoid recursion
DROP POLICY IF EXISTS "clients_self_read" ON public.clients;
DROP POLICY IF EXISTS "clients_view_own_record" ON public.clients;

CREATE POLICY "clients_select_own"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Ensure consultant_country_assignments references profiles correctly
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consultant_country_assignments' AND column_name = 'consultant_id'
  ) THEN
    -- Drop existing foreign key if it exists
    ALTER TABLE public.consultant_country_assignments DROP CONSTRAINT IF EXISTS consultant_country_assignments_consultant_id_fkey;
    
    -- Add proper foreign key to profiles table
    ALTER TABLE public.consultant_country_assignments 
    ADD CONSTRAINT consultant_country_assignments_consultant_id_fkey 
    FOREIGN KEY (consultant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to profiles
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();