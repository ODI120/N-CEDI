-- Migration 002: Site Statistics Table
-- Manages dynamic KPI stats shown in the SectionStats "bento" section

-- 11. site_stats Table
create table if not exists site_stats (
  id             uuid primary key default uuid_generate_v4(),
  value          numeric(10, 2) not null,         -- e.g. 1200, 85.5
  prefix         text,                             -- e.g. '$', '~'
  suffix         text,                             -- e.g. '+', '%'
  label          text not null,                    -- e.g. 'Trained Graduates'
  icon           text,                             -- optional Bootstrap Icon class e.g. 'bi-people-fill'
  display_order  integer default 0 not null,
  is_published   boolean default true not null,
  created_at     timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at     timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table site_stats enable row level security;

-- Public read access for published stats
create policy "Allow public read access on published site stats"
  on site_stats for select
  using (is_published = true);

-- Admin full access (service role / authenticated admins bypass RLS by default,
-- but we add an explicit policy for clarity with anon key + supabase_admin role)
create policy "Allow admin full access on site stats"
  on site_stats for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Performance index
create index idx_site_stats_display_order on site_stats(display_order);

-- ─────────────────────────────────────────────────────────────
-- Seed initial stats to match current hardcoded defaults
-- ─────────────────────────────────────────────────────────────
insert into site_stats (value, suffix, label, icon, display_order) values
  (1200, '+', 'Trained Graduates',  'bi-people-fill',        1),
  (85,   '%', 'Employment Rate',    'bi-briefcase-fill',     2),
  (45,   '+', 'Partner Startups',   'bi-rocket-takeoff-fill',3),
  (12,   null,'Tech & Vocational Labs', 'bi-cpu-fill',       4);

-- ─────────────────────────────────────────────────────────────
-- NOTE: The image slider in SectionStats uses the existing
-- gallery_items table (media_type = 'image', is_published = true)
-- filtered by event_id or program_id as needed. No new table required.
-- ─────────────────────────────────────────────────────────────
