/*
  # Fix Infinite Recursion in Profiles RLS Policies

  1. Problem
    - RLS policies on profiles table are causing infinite recursion
    - This happens when policies reference the profiles table within their conditions

  2. Solution
    - Drop ALL existing policies on profiles table
    - Create simple, non-recursive policies
    - Use auth.uid() directly instead of querying profiles table
    - Use auth metadata for role checks where possible

  3. Security
    - Users can read/update their own profiles
    - Admins can read all profiles (using email check)
    - Public can insert profiles (for registration)
*/

-- First, disable RLS temporarily to avoid issues
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- 1. Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. Users can insert their own profile (for registration)
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 4. Admin can read all profiles (using direct email check)
CREATE POLICY "profiles_admin_select" ON profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@consulting19.com'
        )
    );

-- 5. Admin can update all profiles
CREATE POLICY "profiles_admin_update" ON profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@consulting19.com'
        )
    );

-- 6. Allow public insert for profile creation during signup
CREATE POLICY "profiles_public_insert" ON profiles
    FOR INSERT
    TO public
    WITH CHECK (true);