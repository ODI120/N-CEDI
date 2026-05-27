-- Create enum for admin roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
    CREATE TYPE public.admin_role AS ENUM ('admin', 'editor', 'viewer');
  END IF;
END $$;

-- Table to store admin user metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'admin_users'
  ) THEN
    CREATE TABLE public.admin_users (
      user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
      role public.admin_role DEFAULT 'viewer' NOT NULL,
      is_active boolean DEFAULT true NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL
    );
  END IF;
END $$;

-- Enable Row Level Security
alter table public.admin_users enable row level security;

-- Policy: users can read their own admin record
DROP POLICY IF EXISTS "Admins can view own record" ON public.admin_users;
create policy "Admins can view own record" on public.admin_users
  for select using (auth.uid() = user_id);

-- Policy: admins can read any admin record
DROP POLICY IF EXISTS "Admins can read all" ON public.admin_users;
create policy "Admins can read all" on public.admin_users
  for select using (public.is_admin('viewer'));

-- Policy: admins can update their own record
DROP POLICY IF EXISTS "Admins can update own" ON public.admin_users;
create policy "Admins can update own" on public.admin_users
  for update using (auth.uid() = user_id) with check (public.is_admin('editor'));

-- Trigger to auto‑create admin row on sign‑up (optional)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.admin_users (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
