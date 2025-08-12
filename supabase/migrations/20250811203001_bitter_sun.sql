-- Fix profiles and roles for existing users
-- This script ensures all authenticated users have proper profiles with correct roles

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create or update the ensure_profile function
create or replace function public.ensure_profile()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, role, full_name, created_at, updated_at)
  values (
    new.id, 
    new.email, 
    'client', -- default role
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

-- Recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.ensure_profile();

-- Ensure profiles exist for all current auth users
insert into public.profiles (id, email, role, full_name, created_at, updated_at)
select 
  au.id,
  au.email,
  'client' as role,
  coalesce(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
  now() as created_at,
  now() as updated_at
from auth.users au
where not exists (
  select 1 from public.profiles p where p.id = au.id
);

-- Update specific user roles based on email
update public.profiles 
set role = 'admin', full_name = 'System Administrator'
where email = 'admin@consulting19.com';

update public.profiles 
set role = 'consultant', full_name = 'Georgia Consultant', country = 'Georgia'
where email = 'georgia@consulting19.com';

update public.profiles 
set role = 'client', full_name = 'Test Client'
where email = 'client.georgia@consulting19.com';

update public.profiles 
set role = 'admin', full_name = 'Support Team'
where email = 'support@consulting19.com';

-- Ensure RLS is enabled and policies exist
alter table public.profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

-- Create comprehensive RLS policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create updated_at trigger function if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at trigger to profiles
drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();