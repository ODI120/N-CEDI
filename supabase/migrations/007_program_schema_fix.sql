-- Ensure the programs table has the expected curriculum fields
alter table public.programs
  add column if not exists duration_weeks integer default 12 not null,
  add column if not exists level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  add column if not exists overview text,
  add column if not exists lab_experience text,
  add column if not exists requirements text,
  add column if not exists outcomes text[] default '{}'::text[] not null,
  add column if not exists gallery_urls text[] default '{}'::text[] not null,
  add column if not exists cover_image_url text,
  add column if not exists meta_title text,
  add column if not exists meta_description text;
