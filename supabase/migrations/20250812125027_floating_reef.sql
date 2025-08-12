/*
  # Users table auth integration and RLS setup

  1. Schema Updates
    - Add auth_user_id column to users table
    - Create unique index for auth_user_id
    - Enable Row Level Security

  2. Security Policies
    - Users can read their own data (by auth_user_id)
    - Users can insert their own profile
    - Users can update their own data

  3. Notes
    - This migration ensures users table works with Supabase auth
    - RLS policies protect user data access
*/

-- Ensure auth_user_id column exists
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;

-- Create new policies using auth_user_id
CREATE POLICY "profiles_select_self" ON public.profiles
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());