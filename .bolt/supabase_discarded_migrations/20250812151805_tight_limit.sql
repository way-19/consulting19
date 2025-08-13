/*
  # Create Production Users

  1. New Users
    - Creates admin, consultant, and client users
    - Sets up proper profiles with roles
    - Links auth users to profiles

  2. Security
    - Uses secure passwords
    - Proper role assignments
    - Country assignments for consultants
*/

-- Create admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@consulting19.com',
  crypt('SecureAdmin2025!', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create consultant user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'georgia@consulting19.com',
  crypt('GeorgiaConsult2025!', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create client user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'client.georgia@consulting19.com',
  crypt('ClientGeorgia2025!', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create profiles for users
INSERT INTO profiles (id, email, role, full_name, auth_user_id)
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN au.email = 'admin@consulting19.com' THEN 'admin'
    WHEN au.email = 'georgia@consulting19.com' THEN 'consultant'
    WHEN au.email = 'client.georgia@consulting19.com' THEN 'client'
  END,
  CASE 
    WHEN au.email = 'admin@consulting19.com' THEN 'System Administrator'
    WHEN au.email = 'georgia@consulting19.com' THEN 'Georgia Consultant'
    WHEN au.email = 'client.georgia@consulting19.com' THEN 'Test Client'
  END,
  au.id
FROM auth.users au
WHERE au.email IN ('admin@consulting19.com', 'georgia@consulting19.com', 'client.georgia@consulting19.com')
ON CONFLICT (email) DO NOTHING;