-- Tighten site_stats RLS: remove overly broad authenticated policy from 002.
-- Admin CRUD is governed by is_admin() policies in 003_admin_rbac.sql and
-- admin read-all in 009_admin_content_select_and_storage.sql.

drop policy if exists "Allow admin full access on site stats" on public.site_stats;
