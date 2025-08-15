/*
  # Rename role column to legacy_role in profiles table

  1. Schema Changes
    - Rename `role` column to `legacy_role` in `profiles` table
    - Update all constraints and indexes that reference the old column name
    - Ensure data integrity is maintained during the rename operation

  2. Security
    - All existing RLS policies will continue to work
    - No changes needed to existing policies as they reference the column correctly

  3. Notes
    - This migration ensures compatibility with the frontend code that expects `legacy_role`
    - All existing data will be preserved during the column rename
*/

-- Rename the role column to legacy_role
ALTER TABLE profiles RENAME COLUMN role TO legacy_role;

-- Update the check constraint to use the new column name
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_legacy_role_check 
  CHECK (legacy_role = ANY (ARRAY['admin'::text, 'consultant'::text, 'client'::text]));

-- Update the index to use the new column name
DROP INDEX IF EXISTS idx_profiles_role;
CREATE INDEX idx_profiles_legacy_role ON profiles USING btree (legacy_role);