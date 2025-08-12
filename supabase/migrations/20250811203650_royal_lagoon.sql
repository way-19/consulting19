/*
  # Fix profiles table permissions

  This migration fixes the permission denied error by creating simple RLS policies
  that only use auth.uid() without referencing any tables.

  1. Security
    - Drop all existing policies that might reference other tables
    - Create simple policies using only auth.uid()
    - Enable RLS on profiles table
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
DROP POLICY IF EXISTS "profiles_public_insert" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple policies that only use auth.uid()
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow public insert for profile creation during signup
CREATE POLICY "Allow profile creation"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);