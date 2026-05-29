-- Note: admin_role enum is already created in 003_admin_rbac.sql
-- This ensures consistency across all migrations

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

-- Policy: users can update their own record (non-destructive updates)
DROP POLICY IF EXISTS "Users can update own" ON public.admin_users;
create policy "Users can update own" on public.admin_users
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policy: admins can update any record (with role restrictions)
DROP POLICY IF EXISTS "Admins can manage admin records" ON public.admin_users;
create policy "Admins can manage admin records" on public.admin_users
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));

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
  for each row execute function public.handle_new_user();
