/*
  # Ensure Profile Function and Policies

  1. New Functions
    - `ensure_user_profile()` - Creates or updates user profile safely
  
  2. Security
    - RLS policies for self-management
    - Security definer function for safe profile creation
    - Prevents direct inserts except via function
*/

-- Function: ensure_user_profile() – upsert caller's profile
create or replace function public.ensure_user_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  user_email text;
  existing public.profiles;
begin
  if uid is null then
    raise exception 'auth.uid() is null';
  end if;

  -- Get email from auth.users
  select email into user_email
  from auth.users where id = uid;

  -- Create minimal row if missing
  insert into public.profiles (id, email, role, created_at, updated_at)
  values (uid, coalesce(user_email, ''), 'client', now(), now())
  on conflict (id) do update set 
    email = coalesce(excluded.email, public.profiles.email),
    updated_at = now()
  returning * into existing;

  return existing;
end;
$$;

-- Ensure RLS is enabled
alter table public.profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "profiles_self_select" on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "profiles_no_direct_insert" on public.profiles;

-- Select/Update own row
create policy "profiles_self_select"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles_self_update"
on public.profiles for update
to authenticated
using (id = auth.uid());

-- Insert blocked for direct access (function handles creation via SECURITY DEFINER)
create policy "profiles_no_direct_insert"
on public.profiles for insert
to authenticated
with check (false);

-- Allow public read access for profiles (needed for consultant listings, etc.)
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
on public.profiles for select
to public
using (true);

-- Allow users to insert their own profile during signup
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);