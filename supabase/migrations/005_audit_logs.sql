create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  user_email text,
  resource text,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;

-- Only admins can read audit logs
drop policy if exists "Admins can read audit logs" on public.audit_logs;
create policy "Admins can read audit logs" on public.audit_logs
  for select
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
      and admin_users.is_active = true
    )
  );

-- System or admins can insert audit logs
drop policy if exists "System can insert audit logs" on public.audit_logs;
create policy "System can insert audit logs" on public.audit_logs
  for insert
  with check (true);

-- Seed some initial data
insert into public.audit_logs (action, user_email, resource) values 
('System Initialized', 'system@ncedi.edu.ng', 'system'),
('Admin Enrollment', 'admin@ncedi.edu.ng', 'admin_users'),
('Program Published', 'admin@ncedi.edu.ng', 'programs')
on conflict do nothing;
