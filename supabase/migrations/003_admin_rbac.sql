-- Migration 003: Admin RBAC + admin CRUD policies
-- Goal: enable a secure, RLS-based admin portal without breaking existing public read access.
--
-- Strategy:
-- - Create `admin_users` mapping `auth.users.id` -> role (super_admin/admin/editor/viewer)
-- - Provide helper function `public.is_admin()` for policy readability
-- - Add admin CRUD policies on existing content tables (without removing public read policies)
--
-- Notes:
-- - We do NOT rely on `auth.role()` for admin checks (it is typically just 'anon'/'authenticated').
-- - Service role bypasses RLS automatically; the admin portal should use normal client auth + RLS.

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1) Admin membership table
-- ─────────────────────────────────────────────────────────────
-- Create admin_role enum with hierarchical access levels
do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'admin_role'
  ) then
    create type public.admin_role as enum ('super_admin', 'admin', 'editor', 'viewer');
  end if;
end$$;

create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        public.admin_role not null default 'viewer',
  is_active   boolean not null default true,
  created_at  timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at  timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_admin_users_role on public.admin_users(role);
create index if not exists idx_admin_users_active on public.admin_users(is_active);

alter table public.admin_users enable row level security;

-- Members can read their own membership row (useful for UI gating).
drop policy if exists "Admin users can read own row" on public.admin_users;
create policy "Admin users can read own row"
  on public.admin_users for select
  using (auth.uid() = user_id);

-- Only super_admin/admin can manage membership.
-- (We keep this simple; you can expand later with granular permissions.)
create or replace function public.is_admin(min_role public.admin_role default 'viewer')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.admin_role;
begin
  if auth.uid() is null then
    return false;
  end if;

  select role into r
  from public.admin_users
  where user_id = auth.uid()
    and is_active = true;

  if r is null then
    return false;
  end if;

  -- Role ordering (highest → lowest): super_admin > admin > editor > viewer
  if min_role = 'viewer' then
    return true;
  end if;

  if min_role = 'editor' then
    return (r in ('super_admin', 'admin', 'editor'));
  end if;

  if min_role = 'admin' then
    return (r in ('super_admin', 'admin'));
  end if;

  if min_role = 'super_admin' then
    return (r = 'super_admin');
  end if;

  return false;
end;
$$;

-- Admin membership management (super_admin/admin only).
drop policy if exists "Admin can manage admin_users" on public.admin_users;
create policy "Admin can manage admin_users"
  on public.admin_users for all
  using (public.is_admin('admin'))
  with check (public.is_admin('admin'));

-- ─────────────────────────────────────────────────────────────
-- 2) Admin CRUD policies on existing tables
-- ─────────────────────────────────────────────────────────────
-- We preserve existing public SELECT policies. We only add additional policies for admins.
-- For write access:
-- - editor+: insert/update
-- - admin+: delete (destructive)

-- categories
drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories" on public.categories
  for insert with check (public.is_admin('editor'));
drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories" on public.categories
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories" on public.categories
  for delete using (public.is_admin('admin'));

-- team_members
drop policy if exists "Admins can insert team members" on public.team_members;
create policy "Admins can insert team members" on public.team_members
  for insert with check (public.is_admin('editor'));
drop policy if exists "Admins can update team members" on public.team_members;
create policy "Admins can update team members" on public.team_members
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
drop policy if exists "Admins can delete team members" on public.team_members;
create policy "Admins can delete team members" on public.team_members
  for delete using (public.is_admin('admin'));

-- programs
drop policy if exists "Admins can insert programs" on public.programs;
create policy "Admins can insert programs" on public.programs
  for insert with check (public.is_admin('editor'));
drop policy if exists "Admins can update programs" on public.programs;
create policy "Admins can update programs" on public.programs
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
drop policy if exists "Admins can delete programs" on public.programs;
create policy "Admins can delete programs" on public.programs
  for delete using (public.is_admin('admin'));

-- events
drop policy if exists "Admins can insert events" on public.events;
create policy "Admins can insert events" on public.events
  for insert with check (public.is_admin('editor'));
drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events" on public.events
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events" on public.events
  for delete using (public.is_admin('admin'));

-- posts
drop policy if exists "Admins can insert posts" on public.posts;
create policy "Admins can insert posts" on public.posts
  for insert with check (public.is_admin('editor'));
drop policy if exists "Admins can update posts" on public.posts;
create policy "Admins can update posts" on public.posts
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
drop policy if exists "Admins can delete posts" on public.posts;
create policy "Admins can delete posts" on public.posts
  for delete using (public.is_admin('admin'));

-- testimonials
drop policy if exists "Admins can insert testimonials" on public.testimonials;
create policy "Admins can insert testimonials" on public.testimonials
  for insert with check (public.is_admin('editor'));
drop policy if exists "Admins can update testimonials" on public.testimonials;
create policy "Admins can update testimonials" on public.testimonials
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
drop policy if exists "Admins can delete testimonials" on public.testimonials;
create policy "Admins can delete testimonials" on public.testimonials
  for delete using (public.is_admin('admin'));

-- projects
drop policy if exists "Admins can insert projects" on public.projects;
create policy "Admins can insert projects" on public.projects
  for insert with check (public.is_admin('editor'));
drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects" on public.projects
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects" on public.projects
  for delete using (public.is_admin('admin'));

-- partners
drop policy if exists "Admins can insert partners" on public.partners;
create policy "Admins can insert partners" on public.partners
  for insert with check (public.is_admin('editor'));
drop policy if exists "Admins can update partners" on public.partners;
create policy "Admins can update partners" on public.partners
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
drop policy if exists "Admins can delete partners" on public.partners;
create policy "Admins can delete partners" on public.partners
  for delete using (public.is_admin('admin'));

-- gallery_items
drop policy if exists "Admins can insert gallery items" on public.gallery_items;
create policy "Admins can insert gallery items" on public.gallery_items
  for insert with check (public.is_admin('editor'));
drop policy if exists "Admins can update gallery items" on public.gallery_items;
create policy "Admins can update gallery items" on public.gallery_items
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
drop policy if exists "Admins can delete gallery items" on public.gallery_items;
create policy "Admins can delete gallery items" on public.gallery_items
  for delete using (public.is_admin('admin'));

-- inquiries: admins can read all + update triage fields
drop policy if exists "Admins can read inquiries" on public.inquiries;
create policy "Admins can read inquiries" on public.inquiries
  for select using (public.is_admin('viewer'));
drop policy if exists "Admins can update inquiries" on public.inquiries;
create policy "Admins can update inquiries" on public.inquiries
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
drop policy if exists "Admins can delete inquiries" on public.inquiries;
create policy "Admins can delete inquiries" on public.inquiries
  for delete using (public.is_admin('admin'));

-- site_stats
drop policy if exists "Admins can insert site stats" on public.site_stats;
create policy "Admins can insert site stats" on public.site_stats
  for insert with check (public.is_admin('editor'));
drop policy if exists "Admins can update site stats" on public.site_stats;
create policy "Admins can update site stats" on public.site_stats
  for update using (public.is_admin('editor')) with check (public.is_admin('editor'));
drop policy if exists "Admins can delete site stats" on public.site_stats;
create policy "Admins can delete site stats" on public.site_stats
  for delete using (public.is_admin('admin'));

